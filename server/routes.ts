import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { mongoStorage } from "./db/mongo-storage";
import { isConnected, checkMongoDBHealth } from "./db/mongodb";
import { z } from "zod";
import { auditLogMiddleware, requireTLS } from "./security";
import { analyzeHealthSymptoms, chatWithHealthAssistant } from "./openai";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
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
import passport from 'passport';
import mongoose from 'mongoose';
import { calculateHealthScore } from './utils/health-score';
import { appointmentSchema, type Appointment } from './schemas/appointments';

// Store connected clients by user ID
const clients = new Map<string, Set<WebSocket>>();

// Helper function to normalize user ID to string
function normalizeUserId(userId: string | number): string {
  return userId.toString();
}

// Function to send notifications to a specific user
function sendNotification(userId: string | number, notification: any) {
  const normalizedUserId = normalizeUserId(userId);
  console.log('Attempting to send notification to user:', normalizedUserId);
  console.log('Current connected clients:', Array.from(clients.keys()));
  
  const userClients = clients.get(normalizedUserId);
  if (!userClients || userClients.size === 0) {
    console.log('No connected clients found for user:', normalizedUserId);
    return;
  }

  const message = JSON.stringify(notification);
  userClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log('Notification sent to user:', normalizedUserId);
    }
  });
}

// Add reminder scheduler
function startReminderScheduler() {
  console.log('Starting reminder scheduler...');
  // Check for due reminders every minute
  setInterval(async () => {
    try {
      const now = new Date();
      console.log('\n=== Reminder Scheduler Check ===');
      console.log('Current time:', now.toISOString());
      console.log('Current minute:', now.getMinutes());
      
      // Get all active reminders
      const reminders = await storage.getAllReminders();
      console.log(`Found ${reminders.length} total reminders`);
      
      for (const reminder of reminders) {
        console.log('\nProcessing reminder:', {
          id: reminder.id || reminder._id,  // Handle both MongoDB and regular IDs
          title: reminder.title,
          frequency: reminder.frequency,
          userId: reminder.userId,
          isCompleted: reminder.isCompleted,
          time: reminder.time
        });

        if (reminder.isCompleted || !reminder.frequency) {
          console.log(`Skipping reminder ${reminder.title} - ${reminder.isCompleted ? 'completed' : 'no frequency'}`);
          continue;
        }

        // Check if it's time to send the reminder
        let shouldSend = false;
        
        // Handle time-based frequencies (2min, 5min, etc.) differently
        const frequency = reminder.frequency?.toLowerCase() || '';
        console.log('Checking frequency:', frequency);
        
        if (['2min', '5min', '15min', '30min'].includes(frequency)) {
          // For time-based frequencies, we only care about the current minute
          const currentMinute = now.getMinutes();
          switch (frequency) {
            case '2min':
              shouldSend = currentMinute % 2 === 0;
              break;
            case '5min':
              shouldSend = currentMinute % 5 === 0;
              break;
            case '15min':
              shouldSend = currentMinute % 15 === 0;
              break;
            case '30min':
              shouldSend = currentMinute % 30 === 0;
              break;
          }
          console.log(`Time-based frequency ${frequency}: currentMinute=${currentMinute}, shouldSend=${shouldSend}`);
        } else if (reminder.time) {
          // For other frequencies, parse the time
          const reminderTime = new Date(reminder.time);
          console.log('Parsed reminder time:', reminderTime.toISOString());
          
          const reminderHour = reminderTime.getHours();
          const reminderMinute = reminderTime.getMinutes();
          console.log(`Reminder scheduled for: ${reminderHour}:${reminderMinute}`);

          switch (reminder.frequency.toLowerCase()) {
            case 'hourly':
              shouldSend = now.getMinutes() === 0;
              break;
            case 'daily':
              shouldSend = now.getHours() === reminderHour && now.getMinutes() === reminderMinute;
              break;
            case 'weekly':
              shouldSend = now.getDay() === reminderTime.getDay() && 
                         now.getHours() === reminderHour && 
                         now.getMinutes() === reminderMinute;
              break;
            case 'monthly':
              shouldSend = now.getDate() === reminderTime.getDate() && 
                         now.getHours() === reminderHour && 
                         now.getMinutes() === reminderMinute;
              break;
            case 'once':
              shouldSend = now.getHours() === reminderHour && now.getMinutes() === reminderMinute;
              break;
          }
          console.log(`Frequency ${reminder.frequency}: shouldSend = ${shouldSend}`);
        }

        if (shouldSend) {
          console.log(`Sending reminder: ${reminder.title} (${reminder.frequency})`);
          // Send notification using the string representation of the user ID
          const userIdStr = reminder.userId.toString();
          console.log('Sending notification to user:', userIdStr);
          sendNotification(userIdStr, {
            type: 'reminders',
            data: [reminder]  // Wrap in array since client expects an array
          });
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  }, 60000); // Check every minute
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the reminder scheduler
  startReminderScheduler();
  
  // Set up authentication
  setupAuth(app);
  
  // Apply middleware for HIPAA compliance
  app.use(auditLogMiddleware);
  if (process.env.NODE_ENV === 'production') {
    app.use(requireTLS);
  }
  
  // Create HTTP server first
  const httpServer = createServer(app);

  // Initialize WebSocket server for push notifications (alerts and reminders)
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    // Add these options to ensure proper upgrade handling
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024
    }
  });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    let userId: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);

        if (data.type === 'register' && data.userId) {
          userId = normalizeUserId(data.userId);
          console.log('Registering WebSocket client for user ID:', userId);
          
          if (!clients.has(userId)) {
            clients.set(userId, new Set());
          }
          clients.get(userId)!.add(ws);
          
          console.log('Current connections:', {
            totalUsers: clients.size,
            connectionsForUser: clients.get(userId)!.size
          });

          // Send welcome message first
          ws.send(JSON.stringify({
            type: 'welcome',
            message: 'Connected to WellnessSage WebSocket server',
            timestamp: new Date().toISOString()
          }));

          // Then check and send daily reminders
          checkDailyReminders(userId);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        console.log('WebSocket client disconnected for user:', userId);
        const userClients = clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            clients.delete(userId);
          }
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Function to send pending notifications to a user
  function sendPendingNotifications(userId: string | number) {
    const normalizedUserId = normalizeUserId(userId);
    console.log('Sending pending notifications to user:', normalizedUserId);
    // Add your pending notifications logic here
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
            sendNotification(insight.userId.toString(), {
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
  
  // API route to check database connection status
  app.get("/api/system/db-status", async (req, res) => {
    try {
      const mongoStatus = await checkMongoDBHealth();
      const postgresStatus = {
        connected: !!process.env.DATABASE_URL,
        status: process.env.DATABASE_URL ? 'connected' : 'not configured'
      };
      
      const isDummyMongo = process.env.MONGODB_USERNAME === 'dummy_user' && process.env.NODE_ENV === 'development';
      
      // Return combined status for monitoring
      const result = {
        mongo: {
          ...mongoStatus,
          dummyCredentials: isDummyMongo
        },
        postgres: postgresStatus,
        currentStorageType: isConnected() ? 'MongoDB' : 'In-Memory',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      // Log the database status with sensitive info masked
      const logSafeResult = { ...result };
      console.log('Database status check:', logSafeResult);
      
      res.json(result);
    } catch (error) {
      console.error('Database status check error:', error);
      res.status(500).json({ 
        error: "Failed to check database status", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString() 
      });
    }
  });
  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id/profile", isAuthenticated, async (req, res) => {
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
  app.get("/api/users/:userId/health-data", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const healthData = await storage.getHealthDataByUserId(userId);
    return res.json(healthData);
  });

  app.post("/api/health-data", isAuthenticated, async (req, res) => {
    try {
      console.log('Received health data:', JSON.stringify(req.body));
      
      // Create a modified schema that makes most fields optional
      const modifiedSchema = z.object({
        userId: z.string(),
        date: z.string().or(z.date()).nullable().optional(),
        steps: z.number().nullable().optional(),
        activeMinutes: z.number().nullable().optional(),
        calories: z.number().nullable().optional(),
        sleepHours: z.number().nullable().optional(),
        sleepQuality: z.number().nullable().optional(),
        heartRate: z.number().nullable().optional(),
        healthScore: z.number().nullable().optional(),
        stressLevel: z.number().nullable().optional(),
        healthMetrics: z.any().optional().default({})
      });
      
      const validatedData = modifiedSchema.parse(req.body);
      console.log('Validated health data:', JSON.stringify(validatedData));

       // Calculate health score if not provided
       if (validatedData.healthScore === null || validatedData.healthScore === undefined) {
        validatedData.healthScore = calculateHealthScore(validatedData);
      }
      
      // Create a properly formatted object for storage
      const formattedData = {
        ...validatedData,
        // Ensure date is a Date object
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        // Default empty object for healthMetrics if not provided
        healthMetrics: validatedData.healthMetrics || {}
      };
      
      const healthData = await storage.createHealthData(formattedData);
      return res.status(201).json(healthData);
    } catch (error: any) { // Type error as 'any' to access message property
      console.error('Health data validation error:', error);
      return res.status(400).json({ 
        message: "Invalid health data", 
        error: error?.message || String(error) 
      });
    }
  });

  app.get("/api/users/:userId/health-data/latest", async (req, res) => {
    const userId = req.params.userId;
    const latestHealthData = await storage.getLatestHealthData(userId);
    return res.json(latestHealthData);
  });
  
  app.delete("/api/health-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHealthData(id);
      
      if (!success) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      return res.status(200).json({ message: "Health data deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting health data:', error);
      return res.status(500).json({ 
        message: "Error deleting health data", 
        error: error?.message || String(error)
      });
    }
  });
  
  app.get("/api/users/:userId/health-data/weekly", async (req, res) => {
    const userId = req.params.userId;
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
    try {
      const deviceId = req.params.id;
      let device;
      
      // Check if it's a MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(deviceId)) {
        // Use MongoDB storage for ObjectId
        device = await mongoStorage.connectWearableDevice(deviceId);
      } else {
        // Use numeric ID with in-memory storage
        const numericId = parseInt(deviceId);
        if (isNaN(numericId)) {
          return res.status(400).json({ message: "Invalid device ID format" });
        }
        device = await storage.connectWearableDevice(numericId);
      }

      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      return res.json(device);
    } catch (error) {
      console.error('Error connecting device:', error);
      return res.status(500).json({ message: "Error connecting device" });
    }
  });

  app.put("/api/wearable-devices/:id/disconnect", async (req, res) => {
    try {
      const deviceId = req.params.id;
      let device;
      
      // Check if it's a MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(deviceId)) {
        // Use MongoDB storage for ObjectId
        device = await mongoStorage.disconnectWearableDevice(deviceId);
      } else {
        // Use numeric ID with in-memory storage
        const numericId = parseInt(deviceId);
        if (isNaN(numericId)) {
          return res.status(400).json({ message: "Invalid device ID format" });
        }
        device = await storage.disconnectWearableDevice(numericId);
      }

      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      return res.json(device);
    } catch (error) {
      console.error('Error disconnecting device:', error);
      return res.status(500).json({ message: "Error disconnecting device" });
    }
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
      sendNotification(device.userId.toString(), {
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
    try {
      console.log('Fetching doctors from MongoDB...');
      const doctors = await mongoStorage.getAllDoctors();
      console.log('Fetched doctors:', doctors);
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  });

  app.get('/api/doctors/specialty/:specialty', async (req, res) => {
    try {
      const { specialty } = req.params;
      const doctors = await mongoStorage.getDoctorsBySpecialty(specialty);
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors by specialty:', error);
      res.status(500).json({ error: 'Failed to fetch doctors by specialty' });
    }
  });

  app.get('/api/doctors/location/:location', async (req, res) => {
    try {
      const { location } = req.params;
      const doctors = await mongoStorage.getDoctorsByLocation(location);
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors by location:', error);
      res.status(500).json({ error: 'Failed to fetch doctors by location' });
    }
  });

  // Reminders routes
  app.get("/api/users/:userId/reminders", async (req, res) => {
    const userId = req.params.userId;
    const reminderStorage = isConnected() ? mongoStorage : storage;
    const reminders = await reminderStorage.getRemindersByUserId(userId);
    return res.json(reminders);
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      console.log('Received reminder data:', JSON.stringify(req.body, null, 2));
      const validatedData = insertReminderSchema.parse(req.body);
      console.log('Validated reminder data:', JSON.stringify(validatedData, null, 2));
      
      // Convert userId to MongoDB ObjectId if it's not already
      if (typeof validatedData.userId === 'string' && !validatedData.userId.match(/^[0-9a-fA-F]{24}$/)) {
        validatedData.userId = new mongoose.Types.ObjectId(validatedData.userId);
        console.log('Converted userId to ObjectId:', validatedData.userId.toString());
      }
      
      // Parse the time string (e.g., "11:50 AM")
      if (validatedData.time) {
        const [time, period] = validatedData.time.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        
        // Convert to 24-hour format
        if (period === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }
        
        // Create a date object for today with the specified time
        const date = new Date();
        date.setHours(hour, parseInt(minutes), 0, 0);
        
        validatedData.time = date.toISOString();
        console.log('Normalized time to ISO format:', validatedData.time);
      }
      
      const reminderStorage = isConnected() ? mongoStorage : storage;
      console.log('Using storage type:', isConnected() ? 'MongoDB' : 'In-Memory');
      
      const reminder = await reminderStorage.createReminder(validatedData);
      console.log('Created reminder in MongoDB:', JSON.stringify(reminder, null, 2));
      
      // Send notification using the string representation of the user ID
      const userIdStr = reminder.userId.toString();
      console.log('Sending notification to user:', userIdStr);
      sendNotification(userIdStr, {
        type: 'new_reminder',
        data: reminder
      });
      
      return res.status(201).json(reminder);
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid reminder data",
          errors: error.errors 
        });
      }
      return res.status(400).json({ message: "Invalid reminder data" });
    }
  });

  // Complete a reminder
  app.put('/api/reminders/:id/complete', async (req, res) => {
    try {
      const reminderId = req.params.id;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Convert string ID to MongoDB ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(reminderId);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid reminder ID format' });
      }

      // Get the reminder and verify ownership
      const reminder = await storage.getReminderById(objectId);
      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      // Verify the reminder belongs to the user
      if (reminder.userId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to complete this reminder' });
      }

      // Update the reminder
      const updatedReminder = await storage.completeReminder(objectId);
      if (!updatedReminder) {
        return res.status(500).json({ error: 'Failed to complete reminder' });
      }

      res.json({ message: 'Reminder completed successfully', reminder: updatedReminder });
    } catch (error) {
      console.error('Error completing reminder:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a reminder
  app.delete('/api/reminders/:id', async (req, res) => {
    try {
      const reminderId = req.params.id;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const reminder = await storage.getReminderById(reminderId);
      
      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      // Verify that the reminder belongs to the user
      if (reminder.userId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this reminder' });
      }
      
      // Delete the reminder
      const success = await storage.deleteReminder(reminderId);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete reminder' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  // Goals routes
  app.get("/api/users/:userId/goals", async (req, res) => {
    const userId = req.params.userId;
    const goalStorage = isConnected() ? mongoStorage : storage;
    const goals = await goalStorage.getGoalsByUserId(userId);
    return res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    try {
      console.log('Goal data received:', JSON.stringify(req.body));
      
      // Validate the incoming data
      const validatedData = insertGoalSchema.parse(req.body);
      console.log('Validated goal data:', validatedData);
      
      const goalStorage = isConnected() ? mongoStorage : storage;
      const goal = await goalStorage.createGoal(validatedData);
      console.log('Created goal:', goal);
      
      return res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid goal data",
          errors: error.errors 
        });
      }
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
    const userId = req.params.userId;
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

  // Appointments routes
  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      console.log('Received appointment request:', req.body);
      console.log('User:', req.user);

      // Extract the user ID from the authenticated user
      const patientId = req.user?.id?.toString();
      if (!patientId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const appointmentData = appointmentSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
        patientId // Use the string ID
      });

      console.log('Parsed appointment data:', appointmentData);

      const result = await mongoStorage.create('appointments', appointmentData);
      console.log('Created appointment:', result);

      res.json(result);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(400).json({ error: 'Failed to create appointment', details: error.message });
    }
  });

  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const appointments = await mongoStorage.find('appointments', {
        patientId: req.user?.id // Get appointments for current user
      });
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const appointment = await mongoStorage.findById('appointments', req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  });

  app.put('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const appointmentData = appointmentSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
        updatedAt: new Date()
      });

      const result = await mongoStorage.update('appointments', req.params.id, appointmentData);
      if (!result) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(result);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(400).json({ error: 'Failed to update appointment' });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const result = await mongoStorage.delete('appointments', req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  });

  return httpServer;
}

export function setupAuthRoutes(app: Express) {
  // Login route
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get current user route
  app.get('/api/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      id: req.user.id,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    });
  });
}

// Function to check and send daily reminders
async function checkDailyReminders(userId: string) {
  try {
    console.log('Checking daily reminders for user:', userId);
    const reminders = await storage.getAllReminders();
    console.log('All reminders:', reminders);
    
    const userReminders = reminders.filter(r => {
      const matches = r.userId.toString() === userId && 
                     r.frequency?.toLowerCase() === 'daily' && 
                     !r.isCompleted;
      console.log('Checking reminder:', {
        id: r.id || r._id,
        userId: r.userId,
        frequency: r.frequency,
        isCompleted: r.isCompleted,
        matches
      });
      return matches;
    });
    
    if (userReminders.length > 0) {
      console.log('Found daily reminders:', userReminders.map(r => r.title));
      // Send all daily reminders immediately
      sendNotification(userId, {
        type: 'reminders',
        data: userReminders
      });
      console.log('Sent daily reminders notification to user:', userId);
    } else {
      console.log('No daily reminders found for user:', userId);
    }
  } catch (error) {
    console.error('Error checking daily reminders:', error);
  }
}
