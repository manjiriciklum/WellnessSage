import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
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
      const validatedData = insertHealthDataSchema.parse(req.body);
      const healthData = await storage.createHealthData(validatedData);
      return res.status(201).json(healthData);
    } catch (error) {
      return res.status(400).json({ message: "Invalid health data" });
    }
  });

  app.get("/api/users/:userId/health-data/latest", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const latestHealthData = await storage.getLatestHealthData(userId);
    return res.json(latestHealthData);
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
    
    if (specialty && location) {
      const doctors = await storage.getDoctorsBySpecialtyAndLocation(specialty, location);
      return res.json(doctors);
    } else if (specialty) {
      const doctors = await storage.getDoctorsBySpecialty(specialty);
      return res.json(doctors);
    } else if (location) {
      const doctors = await storage.getDoctorsByLocation(location);
      return res.json(doctors);
    } else {
      const doctors = await storage.getAllDoctors();
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
      const analysis = await storage.analyzeSymptoms(userId, symptoms);
      return res.json(analysis);
    } catch (error) {
      return res.status(400).json({ message: "Invalid symptom data" });
    }
  });

  // For demo purposes, generate random health data
  app.post("/api/demo/generate-data", async (req, res) => {
    const userId = 1; // Default demo user
    await storage.generateDemoData(userId);
    return res.json({ message: "Demo data generated successfully" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
