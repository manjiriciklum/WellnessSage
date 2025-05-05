import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  profileImage: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Health Data Model
export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  steps: integer("steps"),
  activeMinutes: integer("active_minutes"),
  calories: integer("calories"),
  sleepHours: doublePrecision("sleep_hours"),
  sleepQuality: integer("sleep_quality"),
  heartRate: integer("heart_rate"),
  healthScore: integer("health_score"),
  stressLevel: integer("stress_level"),
  healthMetrics: json("health_metrics").default({})
});

export const insertHealthDataSchema = createInsertSchema(healthData).pick({
  userId: true,
  date: true,
  steps: true,
  activeMinutes: true,
  calories: true,
  sleepHours: true,
  sleepQuality: true,
  heartRate: true,
  healthScore: true,
  stressLevel: true,
  healthMetrics: true
});

export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type HealthData = typeof healthData.$inferSelect;

// Wearable Devices Model
export const wearableDevices = pgTable("wearable_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  deviceModel: text("device_model"),
  manufacturer: text("manufacturer"),
  serialNumber: text("serial_number"),
  firmwareVersion: text("firmware_version"),
  batteryLevel: integer("battery_level"),
  isConnected: boolean("is_connected").notNull().default(false),
  lastSynced: timestamp("last_synced"),
  capabilities: json("capabilities").default({}),
  connectionSettings: json("connection_settings").default({}),
});

export const insertWearableDeviceSchema = createInsertSchema(wearableDevices).pick({
  userId: true,
  deviceName: true,
  deviceType: true,
  deviceModel: true,
  manufacturer: true,
  serialNumber: true,
  firmwareVersion: true,
  batteryLevel: true,
  isConnected: true,
  lastSynced: true,
  capabilities: true,
  connectionSettings: true
});

export type InsertWearableDevice = z.infer<typeof insertWearableDeviceSchema>;
export type WearableDevice = typeof wearableDevices.$inferSelect;

// Define capability types for wearable devices
export type DeviceCapabilities = {
  heartRate?: boolean;
  stepCount?: boolean;
  caloriesBurned?: boolean;
  sleep?: boolean;
  bloodOxygen?: boolean;
  ecg?: boolean;
  temperature?: boolean;
  stress?: boolean;
  bloodPressure?: boolean;
  breathingRate?: boolean;
  bodyFatPercentage?: boolean;
  weight?: boolean;
};

export type DeviceConnectionSettings = {
  connectionType: 'bluetooth' | 'wifi' | 'cellular' | 'usb';
  autoSync: boolean;
  syncInterval?: number; // in minutes
  dataPermissions: {
    shareHealthData: boolean;
    shareLocation: boolean;
    shareSleepData: boolean;
  };
};

// Wellness Plan Model
export const wellnessPlans = pgTable("wellness_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planName: text("plan_name").notNull(),
  planType: text("plan_type").notNull(), // fitness, nutrition, sleep, stress
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  goals: json("goals").notNull()
});

export const insertWellnessPlanSchema = createInsertSchema(wellnessPlans).pick({
  userId: true,
  planName: true,
  planType: true,
  description: true,
  startDate: true,
  endDate: true,
  goals: true
});

export type InsertWellnessPlan = z.infer<typeof insertWellnessPlanSchema>;
export type WellnessPlan = typeof wellnessPlans.$inferSelect;

// Doctor Model
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialty: text("specialty").notNull(),
  practice: text("practice").notNull(),
  location: text("location").notNull(),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count"),
  profileImage: text("profile_image")
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  firstName: true,
  lastName: true,
  specialty: true,
  practice: true,
  location: true,
  rating: true,
  reviewCount: true,
  profileImage: true
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

// Reminder Model
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  time: text("time"),
  frequency: text("frequency"),
  isCompleted: boolean("is_completed").default(false),
  category: text("category").notNull(), // medication, hydration, activity, etc.
  color: text("color").default('#1e88e5')
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  description: true,
  time: true,
  frequency: true,
  isCompleted: true,
  category: true,
  color: true
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Goal Model
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  target: integer("target").notNull(),
  current: integer("current").default(0),
  unit: text("unit"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  category: text("category").notNull(), // exercise, sleep, meditation, etc.
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  target: true,
  current: true,
  unit: true,
  startDate: true,
  endDate: true,
  category: true
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// AI Insight Model
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // stress, nutrition, fitness, etc.
  action: text("action"), // view plan, see suggestions, adjust goals, etc.
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false)
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
  action: true,
  isRead: true
});

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

// Health Coach Consultation Model
export const healthConsultations = pgTable("health_consultations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symptoms: text("symptoms").notNull(),
  analysis: text("analysis").notNull(),
  recommendations: text("recommendations").notNull(),
  severity: text("severity").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertHealthConsultationSchema = createInsertSchema(healthConsultations).pick({
  userId: true,
  symptoms: true,
  analysis: true,
  recommendations: true,
  severity: true
});

export type InsertHealthConsultation = z.infer<typeof insertHealthConsultationSchema>;
export type HealthConsultation = typeof healthConsultations.$inferSelect;
