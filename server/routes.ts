import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { mongoStorage } from "./db/mongo-storage";
import { isConnected } from "./db/mongodb";
import { z } from "zod";
import { auditLogMiddleware, requireTLS } from "./security";
import { analyzeHealthSymptoms, chatWithHealthAssistant } from "./openai";
import {
  insertUserSchema,
  insertHealthDataSchema,
  insertWearableDeviceSchema,
  insertWellnessPlanSchema,
  insertReminderSchema,
  insertGoalSchema,
  insertAiInsightSchema,
  insertHealthConsultationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id/profile", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Exclude sensitive info like password
    const { password, ...profile } = user;
    return res.json(profile);
  });

  // Health data routes
  app.get("/api/users/:userId/health-data", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const healthData = await storage.getHealthDataByUserId(userId);
    return res.json(healthData);
  });

  app.post("/api/health-data", async (req, res) => {
    try {
      console.log('Received health data:', JSON.stringify(req.body));
      const validatedData = insertHealthDataSchema.parse(req.body);
      console.log('Validated health data:', JSON.stringify(validatedData));
      const healthData = await storage.createHealthData(validatedData);
      return res.status(201).json(healthData);
    } catch (error) {
      console.error('Health data validation error:', error);
      return res.status(400).json({ message: "Invalid health data", error: error.message });
    }
  });

  app.get("/api/users/:userId/health-data/latest", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const latestHealthData = await storage.getLatestHealthData(userId);
    return res.json(latestHealthData);
  });
  
  app.get("/api/users/:userId/health-data/weekly", async (req, res) => {
    const userId = parseInt(req.params.userId);
    // Log the audit event
    console.log(`AUDIT: view healthData multiple by user ${userId} (weekly data)`);
    const healthData = await storage.getHealthDataByUserId(userId);
    
    // Filter to only get the current week's data
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weeklyData = healthData.filter(data => {
      if (!data.date) return false;
      const dataDate = new Date(data.date);
      return dataDate >= startOfWeek && dataDate <= endOfWeek;
    });
    
    // Sort by date, oldest first
    weeklyData.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    return res.json(weeklyData);
  });

  // Wearable devices routes
  app.get("/api/users/:userId/wearable-devices", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const devices = await storage.getWearableDevicesByUserId(userId);
    return res.json(devices);
  });

  app.post("/api/wearable-devices", async (req, res) => {
    try {
      const validatedData = insertWearableDeviceSchema.parse(req.body);
      const device = await storage.createWearableDevice(validatedData);
      return res.status(201).json(device);
    } catch (error) {
      return res.status(400).json({ message: "Invalid wearable device data" });
    }
  });

  app.put("/api/wearable-devices/:id/connect", async (req, res) => {
    const deviceId = parseInt(req.params.id);
    const device = await storage.connectWearableDevice(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.json(device);
  });

  app.put("/api/wearable-devices/:id/disconnect", async (req, res) => {
    const deviceId = parseInt(req.params.id);
    const device = await storage.disconnectWearableDevice(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.json(device);
  });

  // Import the wearable service functions
  const { syncWearableHealthData, checkDeviceConnectivity, getAvailableFirmwareUpdates } = await import('./services/wearableService');

  // Sync health data from a wearable device
  app.post("/api/wearable-devices/:id/sync", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      if (!device.isConnected) {
        return res.status(400).json({ message: "Device is not connected" });
      }
      
      const healthData = await syncWearableHealthData(deviceId);
      
      if (!healthData) {
        return res.status(500).json({ message: "Failed to sync health data" });
      }
      
      // Send a notification about successful sync
      sendNotification(device.userId, {
        type: 'success',
        title: 'Data Synced',
        message: `${device.deviceName} data has been synced successfully.`,
        autoClose: 3000
      });
      
      return res.json(healthData);
    } catch (error) {
      console.error('Error syncing health data:', error);
      return res.status(500).json({ message: "Error syncing health data" });
    }
  });
  
  // Check device connectivity and status
  app.get("/api/wearable-devices/:id/connectivity", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const connectivityStatus = await checkDeviceConnectivity(deviceId);
      return res.json(connectivityStatus);
    } catch (error) {
      console.error('Error checking device connectivity:', error);
      return res.status(500).json({ message: "Error checking device connectivity" });
    }
  });
  
  // Check for firmware updates
  app.get("/api/wearable-devices/:id/firmware", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const firmwareStatus = await getAvailableFirmwareUpdates(deviceId);
      return res.json(firmwareStatus);
    } catch (error) {
      console.error('Error checking firmware updates:', error);
      return res.status(500).json({ message: "Error checking firmware updates" });
    }
  });
  
  // Get devices by capability
  app.get("/api/wearable-devices/capability/:capability", async (req, res) => {
    try {
      const capability = req.params.capability;
      const devices = await storage.getDevicesByCapability(capability);
      return res.json(devices);
    } catch (error) {
      console.error('Error getting devices by capability:', error);
      return res.status(500).json({ message: "Error retrieving devices" });
    }
  });

  // Wellness plans routes
  app.get("/api/users/:userId/wellness-plans", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const plans = await storage.getWellnessPlansByUserId(userId);
    return res.json(plans);
  });

  app.post("/api/wellness-plans", async (req, res) => {
    try {
      const validatedData = insertWellnessPlanSchema.parse(req.body);
      const plan = await storage.createWellnessPlan(validatedData);
      return res.status(201).json(plan);
    } catch (error) {
      return res.status(400).json({ message: "Invalid wellness plan data" });
    }
  });

  // Doctors routes
  app.get("/api/doctors", async (req, res) => {
    const specialty = req.query.specialty as string | undefined;
    const location = req.query.location as string | undefined;
    
    // Use MongoDB storage when connected, otherwise fall back to in-memory
    const doctorStorage = isConnected() ? mongoStorage : storage;
    
    if (specialty && location) {
      const doctors = await doctorStorage.getDoctorsBySpecialtyAndLocation(specialty, location);
      return res.json(doctors);
    } else if (specialty) {
      const doctors = await doctorStorage.getDoctorsBySpecialty(specialty);
      return res.json(doctors);
    } else if (location) {
      const doctors = await doctorStorage.getDoctorsByLocation(location);
      return res.json(doctors);
    } else {
      const doctors = await doctorStorage.getAllDoctors();
      return res.json(doctors);
    }
  });

  // Reminders routes
  app.get("/api/users/:userId/reminders", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const reminders = await storage.getRemindersByUserId(userId);
    return res.json(reminders);
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      return res.status(201).json(reminder);
    } catch (error) {
      return res.status(400).json({ message: "Invalid reminder data" });
    }
  });

  app.put("/api/reminders/:id/complete", async (req, res) => {
    const reminderId = parseInt(req.params.id);
    const reminder = await storage.completeReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    return res.json(reminder);
  });

  // Goals routes
  app.get("/api/users/:userId/goals", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const goals = await storage.getGoalsByUserId(userId);
    return res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      return res.status(201).json(goal);
    } catch (error) {
      return res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.put("/api/goals/:id/update-progress", async (req, res) => {
    const goalId = parseInt(req.params.id);
    const progressSchema = z.object({
      current: z.number()
    });
    
    try {
      const { current } = progressSchema.parse(req.body);
      const goal = await storage.updateGoalProgress(goalId, current);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      return res.json(goal);
    } catch (error) {
      return res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // AI Insights routes
  app.get("/api/users/:userId/ai-insights", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const insights = await storage.getAiInsightsByUserId(userId);
    return res.json(insights);
  });

  app.post("/api/ai-insights", async (req, res) => {
    try {
      const validatedData = insertAiInsightSchema.parse(req.body);
      const insight = await storage.createAiInsight(validatedData);
      return res.status(201).json(insight);
    } catch (error) {
      return res.status(400).json({ message: "Invalid AI insight data" });
    }
  });

  app.put("/api/ai-insights/:id/mark-read", async (req, res) => {
    const insightId = parseInt(req.params.id);
    const insight = await storage.markAiInsightAsRead(insightId);
    if (!insight) {
      return res.status(404).json({ message: "AI insight not found" });
    }
    return res.json(insight);
  });

  // Health Coach routes
  app.get("/api/users/:userId/health-consultations", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const consultations = await storage.getHealthConsultationsByUserId(userId);
    return res.json(consultations);
  });

  app.get("/api/health-consultations/:id", async (req, res) => {
    const consultationId = parseInt(req.params.id);
    const consultation = await storage.getHealthConsultation(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Health consultation not found" });
    }
    return res.json(consultation);
  });

  app.post("/api/health-consultations", async (req, res) => {
    try {
      const validatedData = insertHealthConsultationSchema.parse(req.body);
      const consultation = await storage.createHealthConsultation(validatedData);
      return res.status(201).json(consultation);
    } catch (error) {
      return res.status(400).json({ message: "Invalid health consultation data" });
    }
  });

  app.post("/api/health-coach/analyze-symptoms", async (req, res) => {
    const symptomsSchema = z.object({
      userId: z.number(),
      symptoms: z.string()
    });
    
    try {
      const { userId, symptoms } = symptomsSchema.parse(req.body);
      // Use the new OpenAI-powered analysis instead of the storage method
      const analysis = await analyzeHealthSymptoms(userId, symptoms);
      
      // Save the consultation to database for HIPAA audit record
      const consultation = await storage.createHealthConsultation({
        userId,
        symptoms,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        severity: analysis.severity
      });
      
      return res.json(consultation);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      return res.status(400).json({ message: "Invalid symptom data or analysis error" });
    }
  });
  
  // New AI chatbot endpoint
  app.post("/api/health-coach/chat", async (req, res) => {
    const chatSchema = z.object({
      userId: z.number(),
      message: z.string()
    });
    
    try {
      const { userId, message } = chatSchema.parse(req.body);
      const response = await chatWithHealthAssistant(userId, message);
      return res.json({ response });
    } catch (error) {
      console.error('Error in chat:', error);
      return res.status(400).json({ message: "Chat processing error" });
    }
  });

  // For demo purposes, generate random health data
  app.post("/api/demo/generate-data", async (req, res) => {
    const userId = 1; // Default demo user
    await storage.generateDemoData(userId);
    return res.json({ message: "Demo data generated successfully" });
  });

  // MongoDB health check endpoint (HIPAA-compliant monitoring)
  app.get("/api/system/health/database", async (req, res) => {
    try {
      const { checkMongoDBHealth } = await import('./db/mongodb');
      const healthStatus = await checkMongoDBHealth();
      
      // Return a 200 status even if the database is down, but include the status
      // This allows monitoring systems to determine the health based on the response body
      return res.json({
        service: 'database',
        timestamp: new Date().toISOString(),
        ...healthStatus
      });
    } catch (error: any) {
      return res.status(500).json({
        service: 'database',
        status: 'error',
        connected: false,
        error: error.message || 'Unknown error checking database health',
        timestamp: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server for push notifications (alerts and reminders)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with their user IDs
  const clients = new Map<number, Set<WebSocket>>();
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    let userId: number | null = null;
    
    // Handle messages from clients
    ws.on('message', (message: string) => {
      try {
        // Parse the message to get the user ID
        const data = JSON.parse(message);
        
        if (data.type === 'register' && data.userId) {
          userId = Number(data.userId);
          
          // Add this connection to the clients map
          if (!clients.has(userId)) {
            clients.set(userId, new Set());
          }
          clients.get(userId)?.add(ws);
          
          console.log(`WebSocket client registered for user ID: ${userId}`);
          
          // Send an initial set of pending notifications
          sendPendingNotifications(userId, ws);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (userId && clients.has(userId)) {
        clients.get(userId)?.delete(ws);
        
        // If no more connections for this user, clean up
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
      }
    });
    
    // Send a welcome message
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to healthcare notification service' }));
  });
  
  // Function to send notifications to a specific user
  function sendNotification(userId: number, notification: any) {
    if (clients.has(userId)) {
      const userClients = clients.get(userId);
      if (userClients) {
        const message = JSON.stringify(notification);
        for (const client of userClients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        }
      }
    }
  }
  
  // Function to send pending notifications (reminders and alerts) to a user
  async function sendPendingNotifications(userId: number, ws: WebSocket) {
    try {
      // Get pending reminders for the user
      const reminders = await storage.getRemindersByUserId(userId);
      const pendingReminders = reminders.filter(r => !r.isCompleted);
      
      if (pendingReminders.length > 0) {
        // Only send if the connection is still open
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'reminders',
            data: pendingReminders
          }));
        }
      }
      
      // Get unread AI insights (alerts) for the user
      const insights = await storage.getAiInsightsByUserId(userId);
      const unreadInsights = insights.filter(i => !i.isRead);
      
      if (unreadInsights.length > 0) {
        // Only send if the connection is still open
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'insights',
            data: unreadInsights
          }));
        }
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }
  
  // Middleware to send push notifications when reminders are created
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      try {
        // Check if this is a reminder creation response
        if (req.method === 'POST' && req.path === '/api/reminders' && res.statusCode === 201) {
          const reminder = JSON.parse(typeof body === 'string' ? body : body.toString());
          if (reminder && reminder.userId) {
            // Send push notification to the user
            sendNotification(reminder.userId, {
              type: 'new_reminder',
              data: reminder
            });
          }
        }
        // Check if this is an AI insight creation response
        else if (req.method === 'POST' && req.path === '/api/ai-insights' && res.statusCode === 201) {
          const insight = JSON.parse(typeof body === 'string' ? body : body.toString());
          if (insight && insight.userId) {
            // Send push notification to the user
            sendNotification(insight.userId, {
              type: 'new_insight',
              data: insight
            });
          }
        }
      } catch (error) {
        console.error('Error in notification middleware:', error);
      }
      
      return originalSend.call(this, body);
    };
    next();
  });
  
  return httpServer;
}
