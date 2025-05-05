var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiInsights: () => aiInsights,
  doctors: () => doctors,
  goals: () => goals,
  healthConsultations: () => healthConsultations,
  healthData: () => healthData,
  insertAiInsightSchema: () => insertAiInsightSchema,
  insertDoctorSchema: () => insertDoctorSchema,
  insertGoalSchema: () => insertGoalSchema,
  insertHealthConsultationSchema: () => insertHealthConsultationSchema,
  insertHealthDataSchema: () => insertHealthDataSchema,
  insertReminderSchema: () => insertReminderSchema,
  insertUserSchema: () => insertUserSchema,
  insertWearableDeviceSchema: () => insertWearableDeviceSchema,
  insertWellnessPlanSchema: () => insertWellnessPlanSchema,
  reminders: () => reminders,
  sessions: () => sessions,
  users: () => users,
  wearableDevices: () => wearableDevices,
  wellnessPlans: () => wellnessPlans
});
import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, varchar, jsonb } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions, users, insertUserSchema, healthData, insertHealthDataSchema, wearableDevices, insertWearableDeviceSchema, wellnessPlans, insertWellnessPlanSchema, doctors, insertDoctorSchema, reminders, insertReminderSchema, goals, insertGoalSchema, aiInsights, insertAiInsightSchema, healthConsultations, insertHealthConsultationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable("sessions", {
      sid: varchar("sid").primaryKey(),
      sess: jsonb("sess").notNull(),
      expire: timestamp("expire").notNull()
    }, (table) => ({
      expireIdx: index("expire_idx").on(table.expire)
    }));
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").notNull().unique(),
      profileImage: text("profile_image"),
      role: text("role").default("user"),
      oauthProvider: text("oauth_provider"),
      oauthId: text("oauth_id"),
      lastLogin: timestamp("last_login"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
      oauthProvider: true,
      oauthId: true,
      lastLogin: true
    });
    healthData = pgTable("health_data", {
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
    insertHealthDataSchema = createInsertSchema(healthData).pick({
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
    wearableDevices = pgTable("wearable_devices", {
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
      connectionSettings: json("connection_settings").default({})
    });
    insertWearableDeviceSchema = createInsertSchema(wearableDevices).pick({
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
    wellnessPlans = pgTable("wellness_plans", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      planName: text("plan_name").notNull(),
      planType: text("plan_type").notNull(),
      // fitness, nutrition, sleep, stress
      description: text("description"),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      goals: json("goals").notNull()
    });
    insertWellnessPlanSchema = createInsertSchema(wellnessPlans).pick({
      userId: true,
      planName: true,
      planType: true,
      description: true,
      startDate: true,
      endDate: true,
      goals: true
    });
    doctors = pgTable("doctors", {
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
    insertDoctorSchema = createInsertSchema(doctors).pick({
      firstName: true,
      lastName: true,
      specialty: true,
      practice: true,
      location: true,
      rating: true,
      reviewCount: true,
      profileImage: true
    });
    reminders = pgTable("reminders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      description: text("description"),
      time: text("time"),
      frequency: text("frequency"),
      isCompleted: boolean("is_completed").default(false),
      category: text("category").notNull(),
      // medication, hydration, activity, etc.
      color: text("color").default("#1e88e5")
    });
    insertReminderSchema = createInsertSchema(reminders).pick({
      userId: true,
      title: true,
      description: true,
      time: true,
      frequency: true,
      isCompleted: true,
      category: true,
      color: true
    });
    goals = pgTable("goals", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      target: integer("target").notNull(),
      current: integer("current").default(0),
      unit: text("unit"),
      startDate: timestamp("start_date").defaultNow(),
      endDate: timestamp("end_date"),
      category: text("category").notNull()
      // exercise, sleep, meditation, etc.
    });
    insertGoalSchema = createInsertSchema(goals).pick({
      userId: true,
      title: true,
      target: true,
      current: true,
      unit: true,
      startDate: true,
      endDate: true,
      category: true
    });
    aiInsights = pgTable("ai_insights", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // stress, nutrition, fitness, etc.
      action: text("action"),
      // view plan, see suggestions, adjust goals, etc.
      createdAt: timestamp("created_at").defaultNow(),
      isRead: boolean("is_read").default(false)
    });
    insertAiInsightSchema = createInsertSchema(aiInsights).pick({
      userId: true,
      title: true,
      description: true,
      category: true,
      action: true,
      isRead: true
    });
    healthConsultations = pgTable("health_consultations", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      symptoms: text("symptoms").notNull(),
      analysis: text("analysis").notNull(),
      recommendations: text("recommendations").notNull(),
      severity: text("severity").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertHealthConsultationSchema = createInsertSchema(healthConsultations).pick({
      userId: true,
      symptoms: true,
      analysis: true,
      recommendations: true,
      severity: true
    });
  }
});

// server/security.ts
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
function encryptData(data) {
  const stringData = typeof data === "string" ? data : data === void 0 || data === null ? "{}" : JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(stringData, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag
  };
}
function decryptData(encryptedData, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
function logAuditEvent(userId, action, resourceType, resourceId, details) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const logEntry = {
    timestamp: timestamp2,
    userId,
    action,
    resourceType,
    resourceId,
    details,
    userIp: "",
    // Should be filled with request IP
    userAgent: ""
    // Should be filled with request user agent
  };
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
  const logFilePath = path.join(AUDIT_LOG_DIR, `audit-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.log`);
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");
  console.log(`AUDIT: ${action} ${resourceType} ${resourceId} by user ${userId}`);
}
function auditLogMiddleware(req, res, next) {
  const userId = req.body.userId || 1;
  const urlParts = req.path.split("/");
  let resourceType = urlParts[1] || "unknown";
  let resourceId = urlParts[2] || "all";
  let action = "";
  switch (req.method) {
    case "GET":
      action = "view";
      break;
    case "POST":
      action = "create";
      break;
    case "PUT":
    case "PATCH":
      action = "update";
      break;
    case "DELETE":
      action = "delete";
      break;
    default:
      action = req.method;
  }
  const logEntry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action,
    resourceType,
    resourceId,
    userIp: req.ip,
    userAgent: req.headers["user-agent"],
    requestPath: req.path,
    requestMethod: req.method
  };
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
  const logFilePath = path.join(AUDIT_LOG_DIR, `api-access-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.log`);
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");
  next();
}
function sessionTimeout(minutes) {
  const timeout = minutes * 60 * 1e3;
  return (req, res, next) => {
    if (req.session) {
      if (req.session.lastActivity) {
        const now = Date.now();
        if (now - req.session.lastActivity > timeout) {
          req.session.destroy((err) => {
            if (err) {
              console.error("Session destruction error:", err);
            }
            return res.status(401).json({ error: "Session expired" });
          });
          return;
        }
      }
      req.session.lastActivity = Date.now();
    }
    next();
  };
}
function requireTLS(req, res, next) {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    if (req.get("x-forwarded-proto") !== "https") {
      console.warn("Non-secure connection attempt in production");
      res.status(403).json({ error: "TLS/SSL Required for HIPAA Compliance" });
      return;
    }
  }
  next();
}
var __filename, __dirname, ENCRYPTION_KEY, ENCRYPTION_IV, ENCRYPTION_ALGORITHM, AUDIT_LOG_DIR;
var init_security = __esm({
  "server/security.ts"() {
    "use strict";
    __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
    ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
    ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString("hex");
    ENCRYPTION_ALGORITHM = "aes-256-gcm";
    AUDIT_LOG_DIR = path.join(__dirname, "../logs");
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_security();
    init_db();
    MemStorage = class {
      users;
      healthData;
      wearableDevices;
      wellnessPlans;
      doctors;
      reminders;
      goals;
      aiInsights;
      healthConsultations;
      userId;
      healthDataId;
      wearableDeviceId;
      wellnessPlanId;
      doctorId;
      reminderId;
      goalId;
      aiInsightId;
      healthConsultationId;
      // Initialize MemoryStore
      sessionStore;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.healthData = /* @__PURE__ */ new Map();
        this.wearableDevices = /* @__PURE__ */ new Map();
        this.wellnessPlans = /* @__PURE__ */ new Map();
        this.doctors = /* @__PURE__ */ new Map();
        this.reminders = /* @__PURE__ */ new Map();
        this.goals = /* @__PURE__ */ new Map();
        this.aiInsights = /* @__PURE__ */ new Map();
        this.healthConsultations = /* @__PURE__ */ new Map();
        this.userId = 1;
        this.healthDataId = 1;
        this.wearableDeviceId = 1;
        this.wellnessPlanId = 1;
        this.doctorId = 1;
        this.reminderId = 1;
        this.goalId = 1;
        this.aiInsightId = 1;
        this.healthConsultationId = 1;
        const MemoryStore = createMemoryStore(session);
        this.sessionStore = new MemoryStore({
          checkPeriod: 864e5
          // prune expired entries every 24h
        });
        this.initializeDemoData();
      }
      // User methods
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email === email
        );
      }
      async getUserByOAuthId(provider, oauthId) {
        return Array.from(this.users.values()).find(
          (user) => user.oauthProvider === provider && user.oauthId === oauthId
        );
      }
      async updateUserLastLogin(id) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = {
          ...user,
          lastLogin: /* @__PURE__ */ new Date()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async createUser(insertUser) {
        const id = this.userId++;
        const user = {
          ...insertUser,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          // Ensure optional fields are properly set to null when undefined
          profileImage: insertUser.profileImage ?? null,
          role: insertUser.role ?? "user",
          oauthProvider: insertUser.oauthProvider ?? null,
          oauthId: insertUser.oauthId ?? null,
          lastLogin: insertUser.lastLogin ?? null
        };
        this.users.set(id, user);
        return user;
      }
      // Health Data methods
      async getHealthDataByUserId(userId) {
        const encryptedData = Array.from(this.healthData.values()).filter(
          (data) => data.userId === userId
        );
        logAuditEvent(userId, "view", "healthData", "multiple", `User ${userId} accessed their health data`);
        return encryptedData.map((record) => {
          if (record.healthMetrics && typeof record.healthMetrics === "object" && record.healthMetrics.isEncrypted) {
            try {
              const { data, iv, authTag } = record.healthMetrics;
              const decryptedMetrics = decryptData(data, iv, authTag);
              return {
                ...record,
                healthMetrics: JSON.parse(decryptedMetrics),
                _decrypted: true
                // Add flag to indicate this was decrypted
              };
            } catch (error) {
              console.error("Error decrypting health data:", error);
              return record;
            }
          }
          return record;
        });
      }
      async getLatestHealthData(userId) {
        const userHealthData = await this.getHealthDataByUserId(userId);
        if (userHealthData.length === 0) return void 0;
        return userHealthData.reduce((latest, current) => {
          if (!latest.date || current.date && current.date > latest.date) {
            return current;
          }
          return latest;
        });
      }
      async createHealthData(insertData) {
        const id = this.healthDataId++;
        const normalizedData = {
          userId: insertData.userId,
          date: insertData.date instanceof Date ? insertData.date : /* @__PURE__ */ new Date(),
          steps: insertData.steps ?? null,
          activeMinutes: insertData.activeMinutes ?? null,
          calories: insertData.calories ?? null,
          sleepHours: insertData.sleepHours ?? null,
          sleepQuality: insertData.sleepQuality ?? null,
          heartRate: insertData.heartRate ?? null,
          healthScore: insertData.healthScore ?? null,
          stressLevel: insertData.stressLevel ?? null,
          healthMetrics: insertData.healthMetrics ?? {}
        };
        let healthMetricsString = typeof normalizedData.healthMetrics === "string" ? normalizedData.healthMetrics : JSON.stringify(normalizedData.healthMetrics || {});
        const { encryptedData, iv, authTag } = encryptData(healthMetricsString);
        const healthData2 = {
          id,
          userId: normalizedData.userId,
          date: normalizedData.date,
          steps: normalizedData.steps,
          activeMinutes: normalizedData.activeMinutes,
          calories: normalizedData.calories,
          sleepHours: normalizedData.sleepHours,
          sleepQuality: normalizedData.sleepQuality,
          heartRate: normalizedData.heartRate,
          healthScore: normalizedData.healthScore,
          stressLevel: normalizedData.stressLevel,
          healthMetrics: {
            data: encryptedData,
            iv,
            authTag,
            isEncrypted: true
          }
        };
        this.healthData.set(id, healthData2);
        logAuditEvent(insertData.userId, "create", "healthData", id, "Created new health data record");
        return healthData2;
      }
      async deleteHealthData(id) {
        const healthData2 = this.healthData.get(id);
        if (!healthData2) return false;
        const success = this.healthData.delete(id);
        if (success) {
          logAuditEvent(healthData2.userId, "delete", "healthData", id, "Deleted health data record");
        }
        return success;
      }
      // Wearable Device methods
      async getWearableDevicesByUserId(userId) {
        return Array.from(this.wearableDevices.values()).filter(
          (device) => device.userId === userId
        );
      }
      async getWearableDevice(id) {
        return this.wearableDevices.get(id);
      }
      async createWearableDevice(insertDevice) {
        const id = this.wearableDeviceId++;
        const device = { ...insertDevice, id };
        this.wearableDevices.set(id, device);
        return device;
      }
      async connectWearableDevice(id) {
        const device = this.wearableDevices.get(id);
        if (!device) return void 0;
        const updatedDevice = {
          ...device,
          isConnected: true,
          lastSynced: /* @__PURE__ */ new Date()
        };
        this.wearableDevices.set(id, updatedDevice);
        return updatedDevice;
      }
      async disconnectWearableDevice(id) {
        const device = this.wearableDevices.get(id);
        if (!device) return void 0;
        const updatedDevice = {
          ...device,
          isConnected: false
        };
        this.wearableDevices.set(id, updatedDevice);
        return updatedDevice;
      }
      async updateWearableDeviceLastSynced(id, lastSynced) {
        const device = this.wearableDevices.get(id);
        if (!device) return void 0;
        const updatedDevice = {
          ...device,
          lastSynced
        };
        this.wearableDevices.set(id, updatedDevice);
        return updatedDevice;
      }
      async getDevicesByCapability(capability) {
        return Array.from(this.wearableDevices.values()).filter((device) => {
          if (!device.capabilities) return false;
          const capabilities = device.capabilities;
          return capabilities[capability] === true;
        });
      }
      // Wellness Plan methods
      async getWellnessPlansByUserId(userId) {
        return Array.from(this.wellnessPlans.values()).filter(
          (plan) => plan.userId === userId
        );
      }
      async getWellnessPlan(id) {
        return this.wellnessPlans.get(id);
      }
      async createWellnessPlan(insertPlan) {
        const id = this.wellnessPlanId++;
        const plan = { ...insertPlan, id };
        this.wellnessPlans.set(id, plan);
        return plan;
      }
      // Doctor methods
      async getAllDoctors() {
        return Array.from(this.doctors.values());
      }
      async getDoctor(id) {
        return this.doctors.get(id);
      }
      async createDoctor(insertDoctor) {
        const id = this.doctorId++;
        const doctor = { ...insertDoctor, id };
        this.doctors.set(id, doctor);
        return doctor;
      }
      async getDoctorsBySpecialty(specialty) {
        return Array.from(this.doctors.values()).filter(
          (doctor) => doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
      }
      async getDoctorsByLocation(location) {
        return Array.from(this.doctors.values()).filter(
          (doctor) => doctor.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      async getDoctorsBySpecialtyAndLocation(specialty, location) {
        return Array.from(this.doctors.values()).filter(
          (doctor) => doctor.specialty.toLowerCase().includes(specialty.toLowerCase()) && doctor.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      // Reminder methods
      async getRemindersByUserId(userId) {
        return Array.from(this.reminders.values()).filter(
          (reminder) => reminder.userId === userId
        );
      }
      async getReminder(id) {
        return this.reminders.get(id);
      }
      async createReminder(insertReminder) {
        const id = this.reminderId++;
        const reminder = { ...insertReminder, id };
        this.reminders.set(id, reminder);
        return reminder;
      }
      async completeReminder(id) {
        const reminder = this.reminders.get(id);
        if (!reminder) return void 0;
        const updatedReminder = {
          ...reminder,
          isCompleted: true
        };
        this.reminders.set(id, updatedReminder);
        return updatedReminder;
      }
      // Goal methods
      async getGoalsByUserId(userId) {
        return Array.from(this.goals.values()).filter(
          (goal) => goal.userId === userId
        );
      }
      async getGoal(id) {
        return this.goals.get(id);
      }
      async createGoal(insertGoal) {
        const id = this.goalId++;
        const goal = {
          id,
          userId: insertGoal.userId,
          title: insertGoal.title,
          target: insertGoal.target,
          category: insertGoal.category,
          // Handle optional fields with defaults
          current: insertGoal.current ?? 0,
          unit: insertGoal.unit ?? "",
          startDate: insertGoal.startDate ?? /* @__PURE__ */ new Date(),
          endDate: insertGoal.endDate ?? null
        };
        this.goals.set(id, goal);
        console.log("Goal created and stored:", goal);
        return goal;
      }
      async updateGoalProgress(id, current) {
        const goal = this.goals.get(id);
        if (!goal) return void 0;
        const updatedGoal = {
          ...goal,
          current
        };
        this.goals.set(id, updatedGoal);
        return updatedGoal;
      }
      // AI Insight methods
      async getAiInsightsByUserId(userId) {
        return Array.from(this.aiInsights.values()).filter(
          (insight) => insight.userId === userId
        );
      }
      async getAiInsight(id) {
        return this.aiInsights.get(id);
      }
      async createAiInsight(insertInsight) {
        const id = this.aiInsightId++;
        const insight = {
          ...insertInsight,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.aiInsights.set(id, insight);
        return insight;
      }
      async markAiInsightAsRead(id) {
        const insight = this.aiInsights.get(id);
        if (!insight) return void 0;
        const updatedInsight = {
          ...insight,
          isRead: true
        };
        this.aiInsights.set(id, updatedInsight);
        return updatedInsight;
      }
      // Health Coach Consultation methods
      async getHealthConsultationsByUserId(userId) {
        const encryptedConsultations = Array.from(this.healthConsultations.values()).filter(
          (consultation) => consultation.userId === userId
        );
        logAuditEvent(userId, "view", "healthConsultation", "multiple", `User ${userId} accessed their health consultations`);
        return encryptedConsultations.map((consultation) => {
          let decryptedConsultation = { ...consultation };
          if (consultation.symptoms && typeof consultation.symptoms === "object" && consultation.symptoms.isEncrypted) {
            try {
              const { data, iv, authTag } = consultation.symptoms;
              decryptedConsultation.symptoms = decryptData(data, iv, authTag);
            } catch (error) {
              console.error("Error decrypting symptoms:", error);
            }
          }
          if (consultation.analysis && typeof consultation.analysis === "object" && consultation.analysis.isEncrypted) {
            try {
              const { data, iv, authTag } = consultation.analysis;
              decryptedConsultation.analysis = decryptData(data, iv, authTag);
            } catch (error) {
              console.error("Error decrypting analysis:", error);
            }
          }
          if (consultation.recommendations && typeof consultation.recommendations === "object" && consultation.recommendations.isEncrypted) {
            try {
              const { data, iv, authTag } = consultation.recommendations;
              decryptedConsultation.recommendations = decryptData(data, iv, authTag);
            } catch (error) {
              console.error("Error decrypting recommendations:", error);
            }
          }
          return decryptedConsultation;
        });
      }
      async getHealthConsultation(id) {
        const consultation = this.healthConsultations.get(id);
        if (!consultation) return void 0;
        logAuditEvent(consultation.userId, "view", "healthConsultation", id, `User accessed consultation #${id}`);
        let decryptedConsultation = { ...consultation };
        if (consultation.symptoms && typeof consultation.symptoms === "object" && consultation.symptoms.isEncrypted) {
          try {
            const { data, iv, authTag } = consultation.symptoms;
            decryptedConsultation.symptoms = decryptData(data, iv, authTag);
          } catch (error) {
            console.error("Error decrypting symptoms:", error);
          }
        }
        if (consultation.analysis && typeof consultation.analysis === "object" && consultation.analysis.isEncrypted) {
          try {
            const { data, iv, authTag } = consultation.analysis;
            decryptedConsultation.analysis = decryptData(data, iv, authTag);
          } catch (error) {
            console.error("Error decrypting analysis:", error);
          }
        }
        if (consultation.recommendations && typeof consultation.recommendations === "object" && consultation.recommendations.isEncrypted) {
          try {
            const { data, iv, authTag } = consultation.recommendations;
            decryptedConsultation.recommendations = decryptData(data, iv, authTag);
          } catch (error) {
            console.error("Error decrypting recommendations:", error);
          }
        }
        return decryptedConsultation;
      }
      async createHealthConsultation(insertConsultation) {
        const id = this.healthConsultationId++;
        const { encryptedData: encryptedSymptoms, iv: symptomsIv, authTag: symptomsAuthTag } = encryptData(insertConsultation.symptoms);
        const { encryptedData: encryptedAnalysis, iv: analysisIv, authTag: analysisAuthTag } = encryptData(insertConsultation.analysis);
        const { encryptedData: encryptedRecommendations, iv: recIv, authTag: recAuthTag } = encryptData(insertConsultation.recommendations);
        const encryptedConsultation = {
          ...insertConsultation,
          symptoms: {
            data: encryptedSymptoms,
            iv: symptomsIv,
            authTag: symptomsAuthTag,
            isEncrypted: true
          },
          analysis: {
            data: encryptedAnalysis,
            iv: analysisIv,
            authTag: analysisAuthTag,
            isEncrypted: true
          },
          recommendations: {
            data: encryptedRecommendations,
            iv: recIv,
            authTag: recAuthTag,
            isEncrypted: true
          }
        };
        const consultation = {
          ...encryptedConsultation,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.healthConsultations.set(id, consultation);
        logAuditEvent(insertConsultation.userId, "create", "healthConsultation", id, "Created new health consultation");
        return consultation;
      }
      async analyzeSymptoms(userId, symptoms) {
        let analysis = "";
        let recommendations = "";
        let severity = "low";
        const symptomsLower = symptoms.toLowerCase();
        if (symptomsLower.includes("headache") || symptomsLower.includes("head pain")) {
          if (symptomsLower.includes("severe") || symptomsLower.includes("worst")) {
            analysis = "Your symptoms may indicate a severe headache, possibly a migraine or tension headache.";
            recommendations = "Rest in a dark, quiet room. Stay hydrated and consider over-the-counter pain relievers. If this is the worst headache of your life or came on suddenly, please seek emergency care immediately.";
            severity = "medium";
          } else {
            analysis = "You appear to be experiencing a mild to moderate headache.";
            recommendations = "Try resting, staying hydrated, and over-the-counter pain relievers if needed. Consider tracking triggers like stress, sleep patterns, or certain foods.";
            severity = "low";
          }
        } else if (symptomsLower.includes("fever") || symptomsLower.includes("temperature")) {
          if (symptomsLower.includes("high") || symptomsLower.includes("103") || symptomsLower.includes("104")) {
            analysis = "You appear to be experiencing a high fever, which could indicate an infection or inflammatory condition.";
            recommendations = "Stay hydrated, rest, and take fever-reducing medication if appropriate. If fever persists above 103\xB0F (39.4\xB0C) for adults or is accompanied by severe symptoms, seek medical attention promptly.";
            severity = "high";
          } else {
            analysis = "You appear to be experiencing a mild fever, which is often a sign that your body is fighting an infection.";
            recommendations = "Rest, stay hydrated, and monitor your temperature. Over-the-counter fever reducers can help manage symptoms. If fever persists for more than 3 days, consult a healthcare provider.";
            severity = "medium";
          }
        } else if (symptomsLower.includes("cough")) {
          if (symptomsLower.includes("blood") || symptomsLower.includes("breathing") || symptomsLower.includes("breath")) {
            analysis = "A cough with blood or breathing difficulties could indicate a serious respiratory condition.";
            recommendations = "Please seek immediate medical attention. These symptoms require proper evaluation by a healthcare professional.";
            severity = "high";
          } else {
            analysis = "You appear to have a common cough, which could be due to a viral infection, allergies, or irritants.";
            recommendations = "Stay hydrated, use honey or lozenges to soothe your throat, and consider over-the-counter cough suppressants for nighttime relief. If the cough persists for more than 2 weeks, consult a healthcare provider.";
            severity = "low";
          }
        } else if (symptomsLower.includes("stomach") || symptomsLower.includes("nausea") || symptomsLower.includes("vomiting")) {
          analysis = "Your symptoms suggest gastrointestinal distress, which could be due to a virus, food poisoning, or digestive issues.";
          recommendations = "Stay hydrated with clear fluids, eat bland foods if tolerated, and rest. If symptoms persist for more than 2 days or are severe, consult a healthcare provider.";
          severity = "medium";
        } else if (symptomsLower.includes("rash") || symptomsLower.includes("skin") || symptomsLower.includes("itchy")) {
          analysis = "You appear to be experiencing a skin reaction or rash, which could be due to an allergy, irritant, or other skin condition.";
          recommendations = "Avoid scratching, use cool compresses for relief, and consider over-the-counter antihistamines or hydrocortisone cream. If the rash spreads, blisters, or is accompanied by other concerning symptoms, consult a healthcare provider.";
          severity = "low";
        } else if (symptomsLower.includes("dizzy") || symptomsLower.includes("dizziness") || symptomsLower.includes("vertigo")) {
          analysis = "Your dizziness could be related to inner ear issues, blood pressure changes, or other conditions affecting balance.";
          recommendations = "Sit or lie down when feeling dizzy, avoid sudden movements, and stay hydrated. If dizziness is severe or persistent, consult a healthcare provider to determine the underlying cause.";
          severity = "medium";
        } else if (symptomsLower.includes("chest pain") || symptomsLower.includes("heart")) {
          analysis = "Chest pain requires immediate attention as it could indicate a cardiac issue.";
          recommendations = "Please seek emergency medical care immediately. Do not wait to see if symptoms improve.";
          severity = "high";
        } else {
          analysis = "Based on the symptoms you have described, you may be experiencing a common health issue.";
          recommendations = "Monitor your symptoms, rest, stay hydrated, and maintain a healthy diet. If symptoms persist or worsen, please consult with a healthcare provider for a proper diagnosis.";
          severity = "low";
        }
        const consultationData = {
          userId,
          symptoms,
          analysis,
          recommendations,
          severity
        };
        return this.createHealthConsultation(consultationData);
      }
      // Initialize demo data
      initializeDemoData() {
        const demoUser = {
          id: 1,
          username: "emmauser",
          password: "password123",
          firstName: "Emma",
          lastName: "Wilson",
          email: "emma@example.com",
          profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
          role: "user",
          oauthProvider: null,
          oauthId: null,
          lastLogin: null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(demoUser.id, demoUser);
        this.userId++;
        const demoDoctors = [
          {
            id: 1,
            firstName: "Sarah",
            lastName: "Johnson",
            specialty: "Cardiology",
            practice: "SF Medical Center",
            location: "San Francisco, CA",
            rating: 4.7,
            reviewCount: 128,
            profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          },
          {
            id: 2,
            firstName: "Michael",
            lastName: "Chen",
            specialty: "Primary Care",
            practice: "Bay Health Clinic",
            location: "San Francisco, CA",
            rating: 4.2,
            reviewCount: 95,
            profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          },
          {
            id: 3,
            firstName: "Emily",
            lastName: "Rodriguez",
            specialty: "Mental Health",
            practice: "Wellbeing Center",
            location: "San Francisco, CA",
            rating: 4.9,
            reviewCount: 210,
            profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          }
        ];
        demoDoctors.forEach((doctor) => {
          this.doctors.set(doctor.id, doctor);
          this.doctorId++;
        });
        const demoDevices = [
          {
            id: 1,
            userId: 1,
            deviceName: "Fitbit Sense",
            deviceType: "watch",
            isConnected: true,
            lastSynced: /* @__PURE__ */ new Date()
          },
          {
            id: 2,
            userId: 1,
            deviceName: "Apple Health",
            deviceType: "smartphone",
            isConnected: true,
            lastSynced: /* @__PURE__ */ new Date()
          },
          {
            id: 3,
            userId: 1,
            deviceName: "Samsung Galaxy Watch 6",
            deviceType: "watch",
            isConnected: false,
            lastSynced: null
          },
          {
            id: 4,
            userId: 1,
            deviceName: "Samsung Galaxy Watch Ultra",
            deviceType: "watch",
            isConnected: false,
            lastSynced: null
          },
          {
            id: 5,
            userId: 1,
            deviceName: "Smart Scale",
            deviceType: "scale",
            isConnected: false,
            lastSynced: null
          }
        ];
        demoDevices.forEach((device) => {
          this.wearableDevices.set(device.id, device);
          this.wearableDeviceId++;
        });
        const demoReminders = [
          {
            id: 1,
            userId: 1,
            title: "Take Medication",
            description: "",
            time: "8:00 AM & 8:00 PM",
            frequency: "daily",
            isCompleted: false,
            category: "medication",
            color: "#f44336"
          },
          {
            id: 2,
            userId: 1,
            title: "Drink Water",
            description: "",
            time: "Every 2 hours",
            frequency: "hourly",
            isCompleted: false,
            category: "hydration",
            color: "#1e88e5"
          },
          {
            id: 3,
            userId: 1,
            title: "Meditation Session",
            description: "",
            time: "6:30 PM",
            frequency: "daily",
            isCompleted: false,
            category: "wellness",
            color: "#26a69a"
          }
        ];
        demoReminders.forEach((reminder) => {
          this.reminders.set(reminder.id, reminder);
          this.reminderId++;
        });
        const demoGoals = [
          {
            id: 1,
            userId: 1,
            title: "Exercise 5 days",
            target: 5,
            current: 3,
            unit: "days",
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 1 week from now
            category: "exercise"
          },
          {
            id: 2,
            userId: 1,
            title: "Sleep 8+ hours",
            target: 7,
            current: 2,
            unit: "days",
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 1 week from now
            category: "sleep"
          },
          {
            id: 3,
            userId: 1,
            title: "Meditation",
            target: 7,
            current: 4,
            unit: "days",
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 1 week from now
            category: "meditation"
          }
        ];
        demoGoals.forEach((goal) => {
          this.goals.set(goal.id, goal);
          this.goalId++;
        });
        const demoInsights = [
          {
            id: 1,
            userId: 1,
            title: "Stress Management Recommendation",
            description: "Your heart rate variability has decreased this week, which may indicate increased stress levels. Consider adding 10-minute meditation sessions in the morning.",
            category: "stress",
            action: "View Plan",
            createdAt: /* @__PURE__ */ new Date(),
            isRead: false
          },
          {
            id: 2,
            userId: 1,
            title: "Nutrition Improvement",
            description: "Based on your food logging patterns, we notice you may benefit from increasing protein intake in the morning. This could help sustain energy levels throughout the day.",
            category: "nutrition",
            action: "See Suggestions",
            createdAt: /* @__PURE__ */ new Date(),
            isRead: false
          },
          {
            id: 3,
            userId: 1,
            title: "Fitness Progress Alert",
            description: "Great job on your consistency! You've met your step goal 5 days in a row. Consider increasing your daily step target by 10% to continue improving cardiovascular health.",
            category: "fitness",
            action: "Adjust Goals",
            createdAt: /* @__PURE__ */ new Date(),
            isRead: false
          }
        ];
        demoInsights.forEach((insight) => {
          this.aiInsights.set(insight.id, insight);
          this.aiInsightId++;
        });
        const today = /* @__PURE__ */ new Date();
        const demoHealthData = {
          id: 1,
          userId: 1,
          date: today,
          steps: 8456,
          activeMinutes: 42,
          calories: 1450,
          sleepHours: 7.33,
          // 7h 20m
          sleepQuality: 72,
          heartRate: 68,
          healthScore: 85,
          stressLevel: 35,
          healthMetrics: {
            activityLevel: 3,
            stepsGoal: 1e4,
            caloriesGoal: 2500,
            sleepGoal: 8,
            hydrationGoal: 2e3,
            heartRateMin: 58,
            heartRateMax: 142,
            deepSleep: 1.8,
            remSleep: 1.5,
            bloodOxygen: 98,
            temperature: 36.6,
            systolic: 120,
            diastolic: 80
          }
        };
        this.healthData.set(demoHealthData.id, demoHealthData);
        this.healthDataId++;
        for (let i = 1; i <= 7; i++) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - i);
          const pastHealthData = {
            id: this.healthDataId++,
            userId: 1,
            date: pastDate,
            steps: 7e3 + Math.floor(Math.random() * 4e3),
            activeMinutes: 30 + Math.floor(Math.random() * 40),
            calories: 1200 + Math.floor(Math.random() * 800),
            sleepHours: 6 + Math.random() * 3,
            sleepQuality: 60 + Math.floor(Math.random() * 30),
            heartRate: 65 + Math.floor(Math.random() * 15),
            healthScore: 75 + Math.floor(Math.random() * 15),
            stressLevel: 30 + Math.floor(Math.random() * 30),
            healthMetrics: {
              activityLevel: Math.floor(Math.random() * 3) + 2,
              // 2-4
              stepsGoal: 1e4,
              caloriesGoal: 2500,
              sleepGoal: 8,
              hydrationGoal: 2e3,
              heartRateMin: 60 + Math.floor(Math.random() * 10) - 5,
              heartRateMax: 120 + Math.floor(Math.random() * 40),
              deepSleep: Math.round((Math.random() * 0.8 + 1.2) * 10) / 10,
              // 1.2-2.0
              remSleep: Math.round((Math.random() * 0.7 + 1.1) * 10) / 10,
              // 1.1-1.8
              bloodOxygen: 95 + Math.floor(Math.random() * 5),
              temperature: Math.round((36.5 + (Math.random() * 0.8 - 0.3)) * 10) / 10
            }
          };
          this.healthData.set(pastHealthData.id, pastHealthData);
        }
      }
      // Generate demo data for a user
      async generateDemoData(userId) {
        return Promise.resolve();
      }
    };
    storage = new MemStorage();
  }
});

// server/db/mongodb.ts
var mongodb_exports = {};
__export(mongodb_exports, {
  checkMongoDBHealth: () => checkMongoDBHealth,
  connectToDatabase: () => connectToDatabase,
  disconnectFromDatabase: () => disconnectFromDatabase,
  isConnected: () => isConnected,
  logMongoDBAccess: () => logMongoDBAccess
});
import mongoose from "mongoose";
async function connectToDatabase(retryAttempts = 3, retryDelay = 3e3) {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const attemptConnection = async (attemptsLeft) => {
    try {
      if (MONGODB_URI) {
        console.log(`Attempting to connect to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@")}`);
        await mongoose.connect(MONGODB_URI, options);
      } else {
        throw new Error("MongoDB URI is not defined");
      }
      console.log("Successfully connected to MongoDB");
      setupMongooseEventListeners();
    } catch (error) {
      if (process.env.NODE_ENV === "development" && process.env.MONGODB_USERNAME === "dummy_user") {
        console.warn("Failed to connect to MongoDB with dummy credentials.");
        console.warn("This is expected in development. You can provide real MongoDB credentials via environment variables when needed.");
        console.warn("Application will continue with in-memory storage fallback.");
        return;
      } else {
        console.error(`Error connecting to MongoDB (${attemptsLeft} attempts left):`, error);
        if (attemptsLeft > 0) {
          console.log(`Retrying MongoDB connection in ${retryDelay / 1e3} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return attemptConnection(attemptsLeft - 1);
        } else {
          console.warn("Maximum MongoDB connection retry attempts reached.");
          console.warn("Application will continue with in-memory storage fallback.");
        }
      }
    }
  };
  return attemptConnection(retryAttempts);
}
function setupMongooseEventListeners() {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
}
async function disconnectFromDatabase() {
  try {
    await mongoose.connection.close();
    console.log("Successfully disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}
function isConnected() {
  return mongoose.connection.readyState === 1;
}
async function checkMongoDBHealth() {
  if (!isConnected()) {
    return {
      connected: false,
      status: "disconnected",
      error: "Not connected to MongoDB"
    };
  }
  try {
    const startTime = Date.now();
    if (!mongoose.connection.db) {
      return {
        connected: false,
        status: "error",
        error: "Database not initialized"
      };
    }
    const result = await mongoose.connection.db.admin().ping();
    const endTime = Date.now();
    if (result && result.ok === 1) {
      const serverInfo = await mongoose.connection.db.admin().serverInfo();
      return {
        connected: true,
        status: "healthy",
        responseTimeMs: endTime - startTime,
        serverInfo: {
          version: serverInfo.version,
          uptime: serverInfo.uptime,
          localTime: serverInfo.localTime
        }
      };
    } else {
      return {
        connected: true,
        status: "degraded",
        responseTimeMs: endTime - startTime,
        error: "Database ping returned unexpected result"
      };
    }
  } catch (error) {
    return {
      connected: false,
      status: "error",
      error: error.message || "Unknown database error"
    };
  }
}
function logMongoDBAccess(userId, action, collection, documentId) {
  logAuditEvent(
    userId,
    action,
    collection,
    documentId || "multiple",
    `MongoDB ${action} on ${collection}`
  );
}
var MONGODB_URI, options;
var init_mongodb = __esm({
  "server/db/mongodb.ts"() {
    "use strict";
    init_security();
    MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (process.env.NODE_ENV === "development" && !process.env.MONGODB_URI && !process.env.MONGODB_HOST) {
      process.env.MONGODB_USERNAME = "dummy_user";
      process.env.MONGODB_PASSWORD = "dummy_password";
      process.env.MONGODB_HOST = "dummycluster.mongodb.net";
      process.env.MONGODB_DATABASE = "healthcare_db";
      console.log("Using dummy MongoDB credentials for development");
    }
    if (!MONGODB_URI && process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD && process.env.MONGODB_HOST) {
      const username = encodeURIComponent(process.env.MONGODB_USERNAME);
      const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
      const host = process.env.MONGODB_HOST;
      const dbName = process.env.MONGODB_DATABASE || "healthcare_db";
      MONGODB_URI = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
      console.log("Constructed MongoDB URI from environment variables");
    } else if (!MONGODB_URI) {
      MONGODB_URI = "mongodb://localhost:27017/healthcare_db";
      console.log("Using local MongoDB fallback URI");
    }
    options = {
      serverSelectionTimeoutMS: 5e3,
      // 5 seconds timeout for server selection
      connectTimeoutMS: 1e4,
      // 10 seconds timeout for initial connection
      socketTimeoutMS: 45e3,
      // Close sockets after 45 seconds of inactivity
      family: 4,
      // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      // Maintain up to 10 socket connections
      minPoolSize: 1,
      // Maintain at least 1 socket connection
      maxIdleTimeMS: 3e4,
      // Close idle connections after 30 seconds
      // Note: autoReconnect option is deprecated and removed, the driver now reconnects by default
      autoIndex: true,
      // Build indexes
      // Auto-create collections if they don't exist
      autoCreate: true,
      heartbeatFrequencyMS: 1e4
      // 10 seconds
    };
  }
});

// server/openai.ts
import OpenAI from "openai";
async function analyzeHealthSymptoms(userId, symptomsDescription) {
  try {
    logAuditEvent(userId, "request", "healthAnalysis", userId.toString(), `User requested health analysis`);
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== DUMMY_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: HEALTH_COACH_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Please analyze these health symptoms: ${symptomsDescription}

Provide your response in JSON format with the following fields:
- analysis: Your analysis of the symptoms
- recommendations: General health recommendations
- severity: A rating of 'low', 'medium', or 'high' based on urgency`
          }
        ],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0].message.content;
      const result = JSON.parse(content || "{}");
      logAuditEvent(userId, "complete", "healthAnalysis", userId.toString(), `Health analysis completed successfully`);
      return {
        analysis: result.analysis,
        recommendations: result.recommendations,
        severity: result.severity
      };
    } else {
      return generateFallbackAnalysis(symptomsDescription);
    }
  } catch (error) {
    console.error("Error analyzing health symptoms:", error);
    logAuditEvent(userId, "error", "healthAnalysis", userId.toString(), `Error analyzing health symptoms`);
    return {
      analysis: "I'm sorry, but I couldn't analyze your symptoms at this time. There might be a technical issue.",
      recommendations: "Please try again later or speak with a healthcare professional if you're concerned about your symptoms.",
      severity: "medium"
    };
  }
}
function generateFallbackAnalysis(symptomsDescription) {
  const symptoms = symptomsDescription.toLowerCase();
  let severity = "low";
  let analysis = "";
  let recommendations = "";
  if (symptoms.includes("headache") || symptoms.includes("head pain")) {
    analysis = "Headaches can have many causes including stress, dehydration, eye strain, or more serious conditions.";
    recommendations = "Try resting in a dark room, staying hydrated, and taking over-the-counter pain relievers if appropriate. If headaches persist or are severe, consult a healthcare professional.";
    severity = symptoms.includes("severe") ? "medium" : "low";
  } else if (symptoms.includes("fever") || symptoms.includes("temperature")) {
    analysis = "Fever is often a sign that your body is fighting an infection.";
    recommendations = "Rest, stay hydrated, and monitor your temperature. If fever exceeds 103\xB0F (39.4\xB0C) or lasts more than three days, seek medical attention.";
    severity = symptoms.includes("high fever") || symptoms.includes("very hot") ? "medium" : "low";
  } else if (symptoms.includes("cough") || symptoms.includes("sore throat")) {
    analysis = "Coughs and sore throats are common with colds, flu, allergies, or respiratory infections.";
    recommendations = "Rest your voice, stay hydrated, and try warm liquids or lozenges. If symptoms persist more than a week or include difficulty breathing, see a doctor.";
    severity = symptoms.includes("can't breathe") || symptoms.includes("difficulty breathing") ? "high" : "low";
  } else if (symptoms.includes("chest pain") || symptoms.includes("heart")) {
    analysis = "Chest pain can have various causes from muscle strain to more serious cardiac conditions.";
    recommendations = "Chest pain, especially with shortness of breath, sweating, or pain radiating to arm/jaw, requires immediate medical attention. Please call emergency services or go to an emergency room.";
    severity = "high";
  } else if (symptoms.includes("stomach") || symptoms.includes("nausea") || symptoms.includes("vomit")) {
    analysis = "Stomach discomfort, nausea, or vomiting can result from food poisoning, viruses, or digestive issues.";
    recommendations = "Try small sips of clear fluids, rest your stomach, and gradually return to normal diet. If symptoms persist more than 2 days or include severe pain, see a doctor.";
    severity = symptoms.includes("blood") ? "high" : "low";
  } else if (symptoms.includes("dizzy") || symptoms.includes("lightheaded")) {
    analysis = "Dizziness can result from dehydration, inner ear issues, low blood pressure, or medication effects.";
    recommendations = "Sit or lie down immediately when feeling dizzy, stay hydrated, and avoid sudden movements. See a doctor if dizziness persists or recurs frequently.";
    severity = "medium";
  } else {
    analysis = "I've noted your symptoms, but I'm not able to provide a specific analysis without a proper medical examination.";
    recommendations = "Monitor your symptoms and consider consulting a healthcare professional if they persist or worsen. Keep track of any changes in how you feel to share with your doctor.";
    severity = "medium";
  }
  analysis += "\n\nRemember, this is not a medical diagnosis, just general information based on the symptoms you've described.";
  return {
    analysis,
    recommendations,
    severity
  };
}
async function chatWithHealthAssistant(userId, message) {
  try {
    logAuditEvent(userId, "request", "healthChat", userId.toString(), `User chat with health assistant`);
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== DUMMY_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: HEALTH_COACH_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message
          }
        ]
      });
      const content = response.choices[0].message.content;
      logAuditEvent(userId, "complete", "healthChat", userId.toString(), `Health chat completed successfully`);
      return content || "I'm sorry, I couldn't generate a response. Please try again.";
    } else {
      return generateFallbackChatResponse(message);
    }
  } catch (error) {
    console.error("Error chatting with health assistant:", error);
    logAuditEvent(userId, "error", "healthChat", userId.toString(), `Error in health chat`);
    return "I'm sorry, but I couldn't process your message at this time. There might be a technical issue. Please try again later or speak with a healthcare professional if you have health concerns.";
  }
}
function generateFallbackChatResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! I'm your health assistant. How can I help you today? Please remember that I can provide general health information, but I'm not a substitute for professional medical advice.";
  } else if (msg.includes("how are you")) {
    return "I'm here and ready to assist you with health information. How are you feeling today? Is there something specific about your health that you'd like to discuss?";
  } else if (msg.includes("thank")) {
    return "You're welcome! If you have any other health-related questions, feel free to ask. Remember to consult with healthcare professionals for personalized medical advice.";
  } else if (msg.includes("help")) {
    return "I can provide general health information and guidance. To help you better, please share specific health concerns or questions you have. Remember that I'm not a replacement for professional medical care.";
  } else if (msg.includes("doctor")) {
    return "While I can provide general health information, I'm not a doctor. For specific medical concerns, diagnosis, or treatment, it's important to consult with a qualified healthcare professional.";
  } else if (msg.includes("exercise") || msg.includes("workout")) {
    return "Regular exercise is beneficial for both physical and mental health. The CDC recommends at least 150 minutes of moderate-intensity activity per week. Before starting a new exercise program, especially if you have existing health conditions, it's advisable to consult with a healthcare provider.";
  } else if (msg.includes("diet") || msg.includes("nutrition") || msg.includes("eat")) {
    return "A balanced diet is essential for good health. Try to include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Individual nutritional needs can vary, so consider consulting with a dietitian for personalized advice.";
  } else if (msg.includes("sleep")) {
    return "Quality sleep is crucial for health. Adults typically need 7-9 hours of sleep per night. If you're having persistent sleep problems, consider discussing them with a healthcare provider, as they could impact various aspects of your health.";
  } else if (msg.includes("stress") || msg.includes("anxiety")) {
    return "Managing stress is important for overall well-being. Techniques like deep breathing, mindfulness meditation, regular exercise, and adequate sleep can help. If stress or anxiety is significantly affecting your daily life, consider seeking support from a mental health professional.";
  } else {
    return "Thank you for your message. I'm here to provide general health information, but I'm not a medical professional. For specific health concerns, it's best to consult with a healthcare provider who can give personalized advice based on your individual health situation.";
  }
}
var DUMMY_KEY, openai, HEALTH_COACH_SYSTEM_PROMPT;
var init_openai = __esm({
  "server/openai.ts"() {
    "use strict";
    init_security();
    DUMMY_KEY = "dummy_sk_openai_key";
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || DUMMY_KEY
    });
    HEALTH_COACH_SYSTEM_PROMPT = `
You are a helpful healthcare assistant providing preliminary guidance. 
Remember to:
- Always include disclaimers that you're not a doctor and cannot provide medical diagnoses
- Provide general health information that might be useful for the user
- Suggest when the user should consider consulting a real healthcare professional
- Maintain a calm, caring, and professional tone
- Be concise and clear in your responses
- Do not provide specific treatment recommendations or diagnoses
- Focus on general health education and guidance
- Never claim to be a licensed medical professional
`;
  }
});

// server/services/wearableService.ts
var wearableService_exports = {};
__export(wearableService_exports, {
  checkDeviceConnectivity: () => checkDeviceConnectivity,
  getAvailableFirmwareUpdates: () => getAvailableFirmwareUpdates,
  getSupportedDeviceTypes: () => getSupportedDeviceTypes,
  syncWearableHealthData: () => syncWearableHealthData
});
async function syncWearableHealthData(deviceId) {
  try {
    const device = await storage.getWearableDevice(deviceId);
    if (!device || !device.isConnected) {
      console.error(`Cannot sync device ${deviceId}: Device not found or not connected`);
      return null;
    }
    const latestHealthData = await storage.getLatestHealthData(device.userId);
    const capabilities = device.capabilities || {};
    const simulatedData = simulateHealthData(latestHealthData, capabilities);
    const newHealthData = {
      userId: device.userId,
      date: /* @__PURE__ */ new Date(),
      healthMetrics: simulatedData,
      // Set some basic values based on the simulated data
      steps: simulatedData.steps || null,
      heartRate: simulatedData.heartRate || null,
      calories: simulatedData.calories || null,
      sleepHours: simulatedData.sleep || null,
      stressLevel: simulatedData.stressLevel || null
    };
    const createdHealthData = await storage.createHealthData(newHealthData);
    await storage.updateWearableDeviceLastSynced(deviceId, /* @__PURE__ */ new Date());
    return createdHealthData;
  } catch (error) {
    console.error("Error syncing wearable health data:", error);
    return null;
  }
}
function getSupportedDeviceTypes() {
  return [
    {
      name: "Smartwatches",
      types: [
        {
          type: "watch",
          models: [
            {
              name: "Apple Watch Series 8",
              manufacturer: "Apple",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                temperature: true
              }
            },
            {
              name: "Apple Watch Ultra",
              manufacturer: "Apple",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                temperature: true
              }
            },
            {
              name: "Samsung Galaxy Watch 6",
              manufacturer: "Samsung",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            },
            {
              name: "Samsung Galaxy Watch Ultra",
              manufacturer: "Samsung",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                stress: true,
                temperature: true
              }
            },
            {
              name: "Fitbit Sense 2",
              manufacturer: "Fitbit",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true,
                temperature: true
              }
            },
            {
              name: "Garmin Forerunner 955",
              manufacturer: "Garmin",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            }
          ]
        }
      ]
    },
    {
      name: "Fitness Trackers",
      types: [
        {
          type: "tracker",
          models: [
            {
              name: "Fitbit Charge 5",
              manufacturer: "Fitbit",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            },
            {
              name: "Garmin Vivosmart 5",
              manufacturer: "Garmin",
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                stress: true
              }
            },
            {
              name: "Whoop Strap 4.0",
              manufacturer: "Whoop",
              capabilities: {
                heartRate: true,
                caloriesBurned: true,
                sleep: true,
                breathingRate: true,
                stress: true
              }
            }
          ]
        }
      ]
    },
    {
      name: "Smart Rings",
      types: [
        {
          type: "ring",
          models: [
            {
              name: "Oura Ring Gen 3",
              manufacturer: "Oura",
              capabilities: {
                heartRate: true,
                sleep: true,
                temperature: true,
                bloodOxygen: true
              }
            }
          ]
        }
      ]
    },
    {
      name: "Smart Scales",
      types: [
        {
          type: "scale",
          models: [
            {
              name: "Withings Body Comp",
              manufacturer: "Withings",
              capabilities: {
                weight: true,
                bodyFatPercentage: true
              }
            },
            {
              name: "Garmin Index S2",
              manufacturer: "Garmin",
              capabilities: {
                weight: true,
                bodyFatPercentage: true
              }
            }
          ]
        }
      ]
    }
  ];
}
function simulateHealthData(latestData, capabilities) {
  const baseData = {
    // Base metrics every device should track
    activityLevel: Math.floor(Math.random() * 5) + 1,
    // 1-5 scale
    stepsGoal: 1e4,
    caloriesGoal: 2500,
    sleepGoal: 8,
    hydrationGoal: 2e3,
    // ml
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (capabilities.stepCount) {
    baseData.steps = Math.floor(Math.random() * 15e3) + 2e3;
  }
  if (capabilities.heartRate) {
    baseData.heartRate = Math.floor(Math.random() * 40) + 60;
    baseData.heartRateMin = baseData.heartRate - Math.floor(Math.random() * 10) - 5;
    baseData.heartRateMax = baseData.heartRate + Math.floor(Math.random() * 40) + 20;
  }
  if (capabilities.caloriesBurned) {
    baseData.calories = Math.floor(Math.random() * 1500) + 500;
  }
  if (capabilities.sleep) {
    baseData.sleep = Math.round(Math.random() * 3 + 5 + Math.random()) * 10 / 10;
    baseData.deepSleep = Math.round(baseData.sleep * 0.25 * 10) / 10;
    baseData.remSleep = Math.round(baseData.sleep * 0.2 * 10) / 10;
  }
  if (capabilities.bloodOxygen) {
    baseData.bloodOxygen = Math.floor(Math.random() * 3) + 96;
  }
  if (capabilities.stress) {
    baseData.stressLevel = Math.floor(Math.random() * 70) + 20;
  }
  if (capabilities.temperature) {
    baseData.temperature = Math.round((36.5 + (Math.random() * 1.6 - 0.8)) * 10) / 10;
  }
  if (capabilities.weight) {
    const prevHealthMetrics = latestData?.healthMetrics || {};
    if (prevHealthMetrics.weight) {
      const prevWeight = parseFloat(prevHealthMetrics.weight);
      baseData.weight = Math.round((prevWeight + (Math.random() * 0.6 - 0.3)) * 10) / 10;
    } else {
      baseData.weight = Math.round((70 + (Math.random() * 20 - 10)) * 10) / 10;
    }
  }
  if (capabilities.bodyFatPercentage) {
    baseData.bodyFatPercentage = Math.round((20 + (Math.random() * 10 - 5)) * 10) / 10;
  }
  if (capabilities.bloodPressure) {
    baseData.systolic = Math.floor(Math.random() * 30) + 110;
    baseData.diastolic = Math.floor(Math.random() * 20) + 70;
  }
  return baseData;
}
async function checkDeviceConnectivity(deviceId) {
  const device = await storage.getWearableDevice(deviceId);
  if (!device) {
    return { connected: false, lastChecked: /* @__PURE__ */ new Date() };
  }
  const batteryLevel = device.batteryLevel || Math.floor(Math.random() * 100);
  const connected = device.isConnected;
  return {
    connected,
    batteryLevel,
    syncStatus: connected ? "Online" : "Offline",
    firmwareStatus: connected ? Math.random() > 0.8 ? "Update Available" : "Up to Date" : "Unknown",
    lastChecked: /* @__PURE__ */ new Date()
  };
}
async function getAvailableFirmwareUpdates(deviceId) {
  const device = await storage.getWearableDevice(deviceId);
  if (!device || !device.isConnected) {
    return { available: false };
  }
  if (!device.firmwareVersion) {
    return { available: false };
  }
  const available = Math.random() > 0.7;
  if (!available) {
    return {
      available: false,
      currentVersion: device.firmwareVersion,
      latestVersion: device.firmwareVersion
    };
  }
  let currentVersionParts = device.firmwareVersion.split(".");
  let newVersionParts = [...currentVersionParts];
  if (Math.random() > 0.5 && newVersionParts.length > 2) {
    newVersionParts[2] = (parseInt(newVersionParts[2]) + 1).toString();
  } else if (newVersionParts.length > 1) {
    newVersionParts[1] = (parseInt(newVersionParts[1]) + 1).toString();
    if (newVersionParts.length > 2) {
      newVersionParts[2] = "0";
    }
  } else {
    newVersionParts[0] = (parseInt(newVersionParts[0]) + 1).toString();
  }
  const latestVersion = newVersionParts.join(".");
  return {
    available: true,
    currentVersion: device.firmwareVersion,
    latestVersion,
    releaseNotes: "Bug fixes and performance improvements. Enhanced heart rate tracking accuracy and battery optimization.",
    updateSize: `${Math.floor(Math.random() * 20) + 10}MB`
  };
}
var init_wearableService = __esm({
  "server/services/wearableService.ts"() {
    "use strict";
    init_storage();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/db/mongo-storage.ts
init_mongodb();

// server/db/models.ts
import mongoose2, { Schema } from "mongoose";
var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
var HealthDataSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  steps: { type: Number, default: null },
  activeMinutes: { type: Number, default: null },
  calories: { type: Number, default: null },
  sleepHours: { type: Number, default: null },
  sleepQuality: { type: Number, default: null },
  heartRate: { type: Number, default: null },
  healthScore: { type: Number, default: null },
  stressLevel: { type: Number, default: null }
});
var WearableDeviceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String, required: true },
  isConnected: { type: Boolean, default: false },
  lastSynced: { type: Date, default: null }
});
var WellnessPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  planName: { type: String, required: true },
  planType: { type: String, required: true },
  description: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  goals: { type: Schema.Types.Mixed, required: true }
});
var DoctorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: true },
  practice: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, default: null },
  profileImage: { type: String, required: true }
});
var ReminderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: { type: String, required: true },
  time: { type: String, default: null },
  frequency: { type: String, default: null },
  isCompleted: { type: Boolean, default: false },
  color: { type: String, default: null }
});
var GoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  unit: { type: String, default: null }
});
var AIInsightSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  action: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});
var HealthConsultationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  symptoms: { type: String, required: true },
  analysis: { type: String, required: true },
  recommendations: { type: String, required: true },
  severity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var ChatMessageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
var models = {
  User: mongoose2.models.User || mongoose2.model("User", UserSchema),
  HealthData: mongoose2.models.HealthData || mongoose2.model("HealthData", HealthDataSchema),
  WearableDevice: mongoose2.models.WearableDevice || mongoose2.model("WearableDevice", WearableDeviceSchema),
  WellnessPlan: mongoose2.models.WellnessPlan || mongoose2.model("WellnessPlan", WellnessPlanSchema),
  Doctor: mongoose2.models.Doctor || mongoose2.model("Doctor", DoctorSchema),
  Reminder: mongoose2.models.Reminder || mongoose2.model("Reminder", ReminderSchema),
  Goal: mongoose2.models.Goal || mongoose2.model("Goal", GoalSchema),
  AIInsight: mongoose2.models.AIInsight || mongoose2.model("AIInsight", AIInsightSchema),
  HealthConsultation: mongoose2.models.HealthConsultation || mongoose2.model("HealthConsultation", HealthConsultationSchema),
  ChatMessage: mongoose2.models.ChatMessage || mongoose2.model("ChatMessage", ChatMessageSchema)
};
var models_default = models;

// server/db/mongo-storage.ts
init_storage();
init_openai();
var MongoStorage = class {
  // Session store
  sessionStore;
  // Method to set session store from main storage
  setSessionStore(store) {
    this.sessionStore = store;
  }
  // User methods
  async getUser(id) {
    try {
      if (!isConnected()) return storage.getUser(id);
      logMongoDBAccess(id, "view", "User", id.toString());
      const user = await models_default.User.findOne({ _id: id });
      if (!user) return void 0;
      return {
        id: user._id,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error("Error getting user from MongoDB:", error);
      return storage.getUser(id);
    }
  }
  async getUserByUsername(username) {
    try {
      if (!isConnected()) return storage.getUserByUsername(username);
      logMongoDBAccess(0, "view", "User", username);
      const user = await models_default.User.findOne({ username });
      if (!user) return void 0;
      return {
        id: user._id,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error("Error getting user by username from MongoDB:", error);
      return storage.getUserByUsername(username);
    }
  }
  async createUser(insertUser) {
    try {
      if (!isConnected()) return storage.createUser(insertUser);
      logMongoDBAccess(0, "create", "User");
      const user = new models_default.User(insertUser);
      await user.save();
      return {
        id: user._id,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return storage.createUser(insertUser);
    }
  }
  // Health Data methods
  async getHealthDataByUserId(userId) {
    try {
      if (!isConnected()) return storage.getHealthDataByUserId(userId);
      logMongoDBAccess(userId, "view", "HealthData", "multiple");
      const healthDataArray = await models_default.HealthData.find({ userId });
      return healthDataArray.map((data) => ({
        id: data._id,
        userId: data.userId,
        date: data.date,
        steps: data.steps,
        activeMinutes: data.activeMinutes,
        calories: data.calories,
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        heartRate: data.heartRate,
        healthScore: data.healthScore,
        stressLevel: data.stressLevel
      }));
    } catch (error) {
      console.error("Error getting health data from MongoDB:", error);
      return storage.getHealthDataByUserId(userId);
    }
  }
  async getLatestHealthData(userId) {
    try {
      if (!isConnected()) return storage.getLatestHealthData(userId);
      logMongoDBAccess(userId, "view", "HealthData", "latest");
      const healthData2 = await models_default.HealthData.findOne({ userId }).sort({ date: -1 });
      if (!healthData2) return void 0;
      return {
        id: healthData2._id,
        userId: healthData2.userId,
        date: healthData2.date,
        steps: healthData2.steps,
        activeMinutes: healthData2.activeMinutes,
        calories: healthData2.calories,
        sleepHours: healthData2.sleepHours,
        sleepQuality: healthData2.sleepQuality,
        heartRate: healthData2.heartRate,
        healthScore: healthData2.healthScore,
        stressLevel: healthData2.stressLevel
      };
    } catch (error) {
      console.error("Error getting latest health data from MongoDB:", error);
      return storage.getLatestHealthData(userId);
    }
  }
  async createHealthData(insertData) {
    try {
      if (!isConnected()) return storage.createHealthData(insertData);
      logMongoDBAccess(insertData.userId, "create", "HealthData");
      const healthData2 = new models_default.HealthData(insertData);
      await healthData2.save();
      return {
        id: healthData2._id,
        userId: healthData2.userId,
        date: healthData2.date,
        steps: healthData2.steps,
        activeMinutes: healthData2.activeMinutes,
        calories: healthData2.calories,
        sleepHours: healthData2.sleepHours,
        sleepQuality: healthData2.sleepQuality,
        heartRate: healthData2.heartRate,
        healthScore: healthData2.healthScore,
        stressLevel: healthData2.stressLevel
      };
    } catch (error) {
      console.error("Error creating health data in MongoDB:", error);
      return storage.createHealthData(insertData);
    }
  }
  // Wearable Device methods
  async getWearableDevicesByUserId(userId) {
    try {
      if (!isConnected()) return storage.getWearableDevicesByUserId(userId);
      logMongoDBAccess(userId, "view", "WearableDevice", "multiple");
      const devices = await models_default.WearableDevice.find({ userId });
      return devices.map((device) => ({
        id: device._id,
        userId: device.userId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      }));
    } catch (error) {
      console.error("Error getting wearable devices from MongoDB:", error);
      return storage.getWearableDevicesByUserId(userId);
    }
  }
  async getWearableDevice(id) {
    try {
      if (!isConnected()) return storage.getWearableDevice(id);
      logMongoDBAccess(0, "view", "WearableDevice", id.toString());
      const device = await models_default.WearableDevice.findById(id);
      if (!device) return void 0;
      return {
        id: device._id,
        userId: device.userId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error("Error getting wearable device from MongoDB:", error);
      return storage.getWearableDevice(id);
    }
  }
  async createWearableDevice(insertDevice) {
    try {
      if (!isConnected()) return storage.createWearableDevice(insertDevice);
      logMongoDBAccess(insertDevice.userId, "create", "WearableDevice");
      const device = new models_default.WearableDevice(insertDevice);
      await device.save();
      return {
        id: device._id,
        userId: device.userId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error("Error creating wearable device in MongoDB:", error);
      return storage.createWearableDevice(insertDevice);
    }
  }
  async connectWearableDevice(id) {
    try {
      if (!isConnected()) return storage.connectWearableDevice(id);
      logMongoDBAccess(0, "update", "WearableDevice", id.toString());
      const device = await models_default.WearableDevice.findByIdAndUpdate(
        id,
        { isConnected: true, lastSynced: /* @__PURE__ */ new Date() },
        { new: true }
      );
      if (!device) return void 0;
      return {
        id: device._id,
        userId: device.userId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error("Error connecting wearable device in MongoDB:", error);
      return storage.connectWearableDevice(id);
    }
  }
  async disconnectWearableDevice(id) {
    try {
      if (!isConnected()) return storage.disconnectWearableDevice(id);
      logMongoDBAccess(0, "update", "WearableDevice", id.toString());
      const device = await models_default.WearableDevice.findByIdAndUpdate(
        id,
        { isConnected: false },
        { new: true }
      );
      if (!device) return void 0;
      return {
        id: device._id,
        userId: device.userId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error("Error disconnecting wearable device in MongoDB:", error);
      return storage.disconnectWearableDevice(id);
    }
  }
  // Wellness Plan methods
  async getWellnessPlansByUserId(userId) {
    try {
      if (!isConnected()) return storage.getWellnessPlansByUserId(userId);
      logMongoDBAccess(userId, "view", "WellnessPlan", "multiple");
      const plans = await models_default.WellnessPlan.find({ userId });
      return plans.map((plan) => ({
        id: plan._id,
        userId: plan.userId,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      }));
    } catch (error) {
      console.error("Error getting wellness plans from MongoDB:", error);
      return storage.getWellnessPlansByUserId(userId);
    }
  }
  async getWellnessPlan(id) {
    try {
      if (!isConnected()) return storage.getWellnessPlan(id);
      logMongoDBAccess(0, "view", "WellnessPlan", id.toString());
      const plan = await models_default.WellnessPlan.findById(id);
      if (!plan) return void 0;
      return {
        id: plan._id,
        userId: plan.userId,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      };
    } catch (error) {
      console.error("Error getting wellness plan from MongoDB:", error);
      return storage.getWellnessPlan(id);
    }
  }
  async createWellnessPlan(insertPlan) {
    try {
      if (!isConnected()) return storage.createWellnessPlan(insertPlan);
      logMongoDBAccess(insertPlan.userId, "create", "WellnessPlan");
      const plan = new models_default.WellnessPlan(insertPlan);
      await plan.save();
      return {
        id: plan._id,
        userId: plan.userId,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      };
    } catch (error) {
      console.error("Error creating wellness plan in MongoDB:", error);
      return storage.createWellnessPlan(insertPlan);
    }
  }
  // Doctor methods
  async getAllDoctors() {
    try {
      if (!isConnected()) return storage.getAllDoctors();
      logMongoDBAccess(0, "view", "Doctor", "multiple");
      const doctors2 = await models_default.Doctor.find({});
      return doctors2.map((doctor) => ({
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      }));
    } catch (error) {
      console.error("Error getting all doctors from MongoDB:", error);
      return storage.getAllDoctors();
    }
  }
  async createDoctor(insertDoctor) {
    try {
      if (!isConnected()) return storage.createDoctor(insertDoctor);
      logMongoDBAccess(0, "create", "Doctor");
      const doctor = new models_default.Doctor(insertDoctor);
      await doctor.save();
      return {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      };
    } catch (error) {
      console.error("Error creating doctor in MongoDB:", error);
      return storage.createDoctor(insertDoctor);
    }
  }
  async getDoctor(id) {
    try {
      if (!isConnected()) return storage.getDoctor(id);
      logMongoDBAccess(0, "view", "Doctor", id.toString());
      const doctor = await models_default.Doctor.findById(id);
      if (!doctor) return void 0;
      return {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      };
    } catch (error) {
      console.error("Error getting doctor from MongoDB:", error);
      return storage.getDoctor(id);
    }
  }
  async getDoctorsBySpecialty(specialty) {
    try {
      if (!isConnected()) return storage.getDoctorsBySpecialty(specialty);
      logMongoDBAccess(0, "view", "Doctor", "by-specialty");
      const doctors2 = await models_default.Doctor.find({ specialty });
      return doctors2.map((doctor) => ({
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      }));
    } catch (error) {
      console.error("Error getting doctors by specialty from MongoDB:", error);
      return storage.getDoctorsBySpecialty(specialty);
    }
  }
  async getDoctorsByLocation(location) {
    try {
      if (!isConnected()) return storage.getDoctorsByLocation(location);
      logMongoDBAccess(0, "view", "Doctor", "by-location");
      const doctors2 = await models_default.Doctor.find({ location });
      return doctors2.map((doctor) => ({
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      }));
    } catch (error) {
      console.error("Error getting doctors by location from MongoDB:", error);
      return storage.getDoctorsByLocation(location);
    }
  }
  async getDoctorsBySpecialtyAndLocation(specialty, location) {
    try {
      if (!isConnected()) return storage.getDoctorsBySpecialtyAndLocation(specialty, location);
      logMongoDBAccess(0, "view", "Doctor", "by-specialty-location");
      const doctors2 = await models_default.Doctor.find({ specialty, location });
      return doctors2.map((doctor) => ({
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        practice: doctor.practice,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        profileImage: doctor.profileImage || null
      }));
    } catch (error) {
      console.error("Error getting doctors by specialty and location from MongoDB:", error);
      return storage.getDoctorsBySpecialtyAndLocation(specialty, location);
    }
  }
  // Reminder methods
  async getRemindersByUserId(userId) {
    try {
      if (!isConnected()) return storage.getRemindersByUserId(userId);
      logMongoDBAccess(userId, "view", "Reminder", "multiple");
      const reminders2 = await models_default.Reminder.find({ userId });
      return reminders2.map((reminder) => ({
        id: reminder._id,
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      }));
    } catch (error) {
      console.error("Error getting reminders from MongoDB:", error);
      return storage.getRemindersByUserId(userId);
    }
  }
  async getReminder(id) {
    try {
      if (!isConnected()) return storage.getReminder(id);
      logMongoDBAccess(0, "view", "Reminder", id.toString());
      const reminder = await models_default.Reminder.findById(id);
      if (!reminder) return void 0;
      return {
        id: reminder._id,
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error("Error getting reminder from MongoDB:", error);
      return storage.getReminder(id);
    }
  }
  async createReminder(insertReminder) {
    try {
      if (!isConnected()) return storage.createReminder(insertReminder);
      logMongoDBAccess(insertReminder.userId, "create", "Reminder");
      const reminder = new models_default.Reminder(insertReminder);
      await reminder.save();
      return {
        id: reminder._id,
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error("Error creating reminder in MongoDB:", error);
      return storage.createReminder(insertReminder);
    }
  }
  async completeReminder(id) {
    try {
      if (!isConnected()) return storage.completeReminder(id);
      logMongoDBAccess(0, "update", "Reminder", id.toString());
      const reminder = await models_default.Reminder.findByIdAndUpdate(
        id,
        { isCompleted: true },
        { new: true }
      );
      if (!reminder) return void 0;
      return {
        id: reminder._id,
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error("Error completing reminder in MongoDB:", error);
      return storage.completeReminder(id);
    }
  }
  // Goal methods
  async getGoalsByUserId(userId) {
    try {
      if (!isConnected()) return storage.getGoalsByUserId(userId);
      logMongoDBAccess(userId, "view", "Goal", "multiple");
      const goals2 = await models_default.Goal.find({ userId });
      return goals2.map((goal) => ({
        id: goal._id,
        userId: goal.userId,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      }));
    } catch (error) {
      console.error("Error getting goals from MongoDB:", error);
      return storage.getGoalsByUserId(userId);
    }
  }
  async getGoal(id) {
    try {
      if (!isConnected()) return storage.getGoal(id);
      logMongoDBAccess(0, "view", "Goal", id.toString());
      const goal = await models_default.Goal.findById(id);
      if (!goal) return void 0;
      return {
        id: goal._id,
        userId: goal.userId,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error("Error getting goal from MongoDB:", error);
      return storage.getGoal(id);
    }
  }
  async createGoal(insertGoal) {
    try {
      if (!isConnected()) return storage.createGoal(insertGoal);
      logMongoDBAccess(insertGoal.userId, "create", "Goal");
      const goal = new models_default.Goal(insertGoal);
      await goal.save();
      return {
        id: goal._id,
        userId: goal.userId,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error("Error creating goal in MongoDB:", error);
      return storage.createGoal(insertGoal);
    }
  }
  async updateGoalProgress(id, current) {
    try {
      if (!isConnected()) return storage.updateGoalProgress(id, current);
      logMongoDBAccess(0, "update", "Goal", id.toString());
      const goal = await models_default.Goal.findByIdAndUpdate(
        id,
        { current },
        { new: true }
      );
      if (!goal) return void 0;
      return {
        id: goal._id,
        userId: goal.userId,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error("Error updating goal progress in MongoDB:", error);
      return storage.updateGoalProgress(id, current);
    }
  }
  // AI Insight methods
  async getAiInsightsByUserId(userId) {
    try {
      if (!isConnected()) return storage.getAiInsightsByUserId(userId);
      logMongoDBAccess(userId, "view", "AIInsight", "multiple");
      const insights = await models_default.AIInsight.find({ userId });
      return insights.map((insight) => ({
        id: insight._id,
        userId: insight.userId,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      }));
    } catch (error) {
      console.error("Error getting AI insights from MongoDB:", error);
      return storage.getAiInsightsByUserId(userId);
    }
  }
  async getAiInsight(id) {
    try {
      if (!isConnected()) return storage.getAiInsight(id);
      logMongoDBAccess(0, "view", "AIInsight", id.toString());
      const insight = await models_default.AIInsight.findById(id);
      if (!insight) return void 0;
      return {
        id: insight._id,
        userId: insight.userId,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error("Error getting AI insight from MongoDB:", error);
      return storage.getAiInsight(id);
    }
  }
  async createAiInsight(insertInsight) {
    try {
      if (!isConnected()) return storage.createAiInsight(insertInsight);
      logMongoDBAccess(insertInsight.userId, "create", "AIInsight");
      const insight = new models_default.AIInsight(insertInsight);
      await insight.save();
      return {
        id: insight._id,
        userId: insight.userId,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error("Error creating AI insight in MongoDB:", error);
      return storage.createAiInsight(insertInsight);
    }
  }
  async markAiInsightAsRead(id) {
    try {
      if (!isConnected()) return storage.markAiInsightAsRead(id);
      logMongoDBAccess(0, "update", "AIInsight", id.toString());
      const insight = await models_default.AIInsight.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      if (!insight) return void 0;
      return {
        id: insight._id,
        userId: insight.userId,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error("Error marking AI insight as read in MongoDB:", error);
      return storage.markAiInsightAsRead(id);
    }
  }
  // Health Coach methods
  async getHealthConsultationsByUserId(userId) {
    try {
      if (!isConnected()) return storage.getHealthConsultationsByUserId(userId);
      logMongoDBAccess(userId, "view", "HealthConsultation", "multiple");
      const consultations = await models_default.HealthConsultation.find({ userId });
      return consultations.map((consultation) => ({
        id: consultation._id,
        userId: consultation.userId,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      }));
    } catch (error) {
      console.error("Error getting health consultations from MongoDB:", error);
      return storage.getHealthConsultationsByUserId(userId);
    }
  }
  async getHealthConsultation(id) {
    try {
      if (!isConnected()) return storage.getHealthConsultation(id);
      logMongoDBAccess(0, "view", "HealthConsultation", id.toString());
      const consultation = await models_default.HealthConsultation.findById(id);
      if (!consultation) return void 0;
      return {
        id: consultation._id,
        userId: consultation.userId,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      };
    } catch (error) {
      console.error("Error getting health consultation from MongoDB:", error);
      return storage.getHealthConsultation(id);
    }
  }
  async createHealthConsultation(insertConsultation) {
    try {
      if (!isConnected()) return storage.createHealthConsultation(insertConsultation);
      logMongoDBAccess(insertConsultation.userId, "create", "HealthConsultation");
      const consultation = new models_default.HealthConsultation(insertConsultation);
      await consultation.save();
      return {
        id: consultation._id,
        userId: consultation.userId,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      };
    } catch (error) {
      console.error("Error creating health consultation in MongoDB:", error);
      return storage.createHealthConsultation(insertConsultation);
    }
  }
  async analyzeSymptoms(userId, symptoms) {
    try {
      if (!isConnected()) return storage.analyzeSymptoms(userId, symptoms);
      const analysis = await analyzeHealthSymptoms(userId, symptoms);
      const consultationData = {
        userId,
        symptoms,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        severity: analysis.severity
      };
      return this.createHealthConsultation(consultationData);
    } catch (error) {
      console.error("Error analyzing symptoms with MongoDB storage:", error);
      return storage.analyzeSymptoms(userId, symptoms);
    }
  }
  // Chat methods specific to MongoDB implementation
  async saveChatMessage(userId, role, content) {
    try {
      if (!isConnected()) return;
      logMongoDBAccess(userId, "create", "ChatMessage");
      const message = new models_default.ChatMessage({
        userId,
        role,
        content,
        timestamp: /* @__PURE__ */ new Date()
      });
      await message.save();
    } catch (error) {
      console.error("Error saving chat message to MongoDB:", error);
    }
  }
  async getChatHistory(userId, limit = 50) {
    try {
      if (!isConnected()) return [];
      logMongoDBAccess(userId, "view", "ChatMessage", "history");
      const messages = await models_default.ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(limit);
      return messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })).reverse();
    } catch (error) {
      console.error("Error getting chat history from MongoDB:", error);
      return [];
    }
  }
  // Demo data generation (reuses in-memory implementation for simplicity)
  async generateDemoData(userId) {
    return storage.generateDemoData(userId);
  }
};
var mongoStorage = new MongoStorage();

// server/routes.ts
init_mongodb();
init_security();
init_openai();
import { z } from "zod";

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `/api/auth/google/callback`,
          scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByOAuthId("google", profile.id);
            if (!user) {
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : "";
              const username = profile.displayName.toLowerCase().replace(/\s+/g, ".") + Math.floor(Math.random() * 1e3);
              user = await storage.createUser({
                username,
                password: await hashPassword(randomBytes(16).toString("hex")),
                // Random secure password
                firstName: profile.name?.givenName || profile.displayName.split(" ")[0],
                lastName: profile.name?.familyName || profile.displayName.split(" ").slice(1).join(" "),
                email,
                profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauthProvider: "google",
                oauthId: profile.id
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `/api/auth/facebook/callback`,
          profileFields: ["id", "displayName", "photos", "email", "name"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByOAuthId("facebook", profile.id);
            if (!user) {
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : "";
              const username = profile.displayName.toLowerCase().replace(/\s+/g, ".") + Math.floor(Math.random() * 1e3);
              user = await storage.createUser({
                username,
                password: await hashPassword(randomBytes(16).toString("hex")),
                // Random secure password
                firstName: profile.name?.givenName || profile.displayName.split(" ")[0],
                lastName: profile.name?.familyName || profile.displayName.split(" ").slice(1).join(" "),
                email,
                profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauthProvider: "facebook",
                oauthId: profile.id
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || "Authentication failed" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    res.json(req.user);
  });
  app2.get("/api/auth/google", passport.authenticate("google"));
  app2.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );
  app2.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app2.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Not authorized" });
}

// server/routes.ts
init_schema();
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use(auditLogMiddleware);
  if (process.env.NODE_ENV === "production") {
    app2.use(requireTLS);
  }
  app2.get("/api/system/db-status", async (req, res) => {
    try {
      const mongoStatus = await checkMongoDBHealth();
      const postgresStatus = {
        connected: !!process.env.DATABASE_URL,
        status: process.env.DATABASE_URL ? "connected" : "not configured"
      };
      const isDummyMongo = process.env.MONGODB_USERNAME === "dummy_user" && process.env.NODE_ENV === "development";
      const result = {
        mongo: {
          ...mongoStatus,
          dummyCredentials: isDummyMongo
        },
        postgres: postgresStatus,
        currentStorageType: isConnected() ? "MongoDB" : "In-Memory",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: process.env.NODE_ENV || "unknown"
      };
      const logSafeResult = { ...result };
      console.log("Database status check:", logSafeResult);
      res.json(result);
    } catch (error) {
      console.error("Database status check error:", error);
      res.status(500).json({
        error: "Failed to check database status",
        details: error instanceof Error ? error.message : String(error),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });
  app2.post("/api/users", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.get("/api/users/:id/profile", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...profile } = user;
    return res.json(profile);
  });
  app2.get("/api/users/:userId/health-data", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const healthData2 = await storage.getHealthDataByUserId(userId);
    return res.json(healthData2);
  });
  app2.post("/api/health-data", isAuthenticated, async (req, res) => {
    try {
      console.log("Received health data:", JSON.stringify(req.body));
      const modifiedSchema = z.object({
        userId: z.number(),
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
      console.log("Validated health data:", JSON.stringify(validatedData));
      const formattedData = {
        ...validatedData,
        // Ensure date is a Date object
        date: validatedData.date ? new Date(validatedData.date) : /* @__PURE__ */ new Date(),
        // Default empty object for healthMetrics if not provided
        healthMetrics: validatedData.healthMetrics || {}
      };
      const healthData2 = await storage.createHealthData(formattedData);
      return res.status(201).json(healthData2);
    } catch (error) {
      console.error("Health data validation error:", error);
      return res.status(400).json({
        message: "Invalid health data",
        error: error?.message || String(error)
      });
    }
  });
  app2.get("/api/users/:userId/health-data/latest", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const latestHealthData = await storage.getLatestHealthData(userId);
    return res.json(latestHealthData);
  });
  app2.delete("/api/health-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHealthData(id);
      if (!success) {
        return res.status(404).json({ message: "Health data not found" });
      }
      return res.status(200).json({ message: "Health data deleted successfully" });
    } catch (error) {
      console.error("Error deleting health data:", error);
      return res.status(500).json({
        message: "Error deleting health data",
        error: error?.message || String(error)
      });
    }
  });
  app2.get("/api/users/:userId/health-data/weekly", async (req, res) => {
    const userId = parseInt(req.params.userId);
    console.log(`AUDIT: view healthData multiple by user ${userId} (weekly data)`);
    const healthData2 = await storage.getHealthDataByUserId(userId);
    const today = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const weeklyData = healthData2.filter((data) => {
      if (!data.date) return false;
      const dataDate = new Date(data.date);
      return dataDate >= startOfWeek && dataDate <= endOfWeek;
    });
    weeklyData.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return res.json(weeklyData);
  });
  app2.get("/api/users/:userId/wearable-devices", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const devices = await storage.getWearableDevicesByUserId(userId);
    return res.json(devices);
  });
  app2.post("/api/wearable-devices", async (req, res) => {
    try {
      const validatedData = insertWearableDeviceSchema.parse(req.body);
      const device = await storage.createWearableDevice(validatedData);
      return res.status(201).json(device);
    } catch (error) {
      return res.status(400).json({ message: "Invalid wearable device data" });
    }
  });
  app2.put("/api/wearable-devices/:id/connect", async (req, res) => {
    const deviceId = parseInt(req.params.id);
    const device = await storage.connectWearableDevice(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.json(device);
  });
  app2.put("/api/wearable-devices/:id/disconnect", async (req, res) => {
    const deviceId = parseInt(req.params.id);
    const device = await storage.disconnectWearableDevice(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.json(device);
  });
  const { syncWearableHealthData: syncWearableHealthData2, checkDeviceConnectivity: checkDeviceConnectivity2, getAvailableFirmwareUpdates: getAvailableFirmwareUpdates2 } = await Promise.resolve().then(() => (init_wearableService(), wearableService_exports));
  app2.post("/api/wearable-devices/:id/sync", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (!device.isConnected) {
        return res.status(400).json({ message: "Device is not connected" });
      }
      const healthData2 = await syncWearableHealthData2(deviceId);
      if (!healthData2) {
        return res.status(500).json({ message: "Failed to sync health data" });
      }
      sendNotification(device.userId, {
        type: "success",
        title: "Data Synced",
        message: `${device.deviceName} data has been synced successfully.`,
        autoClose: 3e3
      });
      return res.json(healthData2);
    } catch (error) {
      console.error("Error syncing health data:", error);
      return res.status(500).json({ message: "Error syncing health data" });
    }
  });
  app2.get("/api/wearable-devices/:id/connectivity", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      const connectivityStatus = await checkDeviceConnectivity2(deviceId);
      return res.json(connectivityStatus);
    } catch (error) {
      console.error("Error checking device connectivity:", error);
      return res.status(500).json({ message: "Error checking device connectivity" });
    }
  });
  app2.get("/api/wearable-devices/:id/firmware", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getWearableDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      const firmwareStatus = await getAvailableFirmwareUpdates2(deviceId);
      return res.json(firmwareStatus);
    } catch (error) {
      console.error("Error checking firmware updates:", error);
      return res.status(500).json({ message: "Error checking firmware updates" });
    }
  });
  app2.get("/api/wearable-devices/capability/:capability", async (req, res) => {
    try {
      const capability = req.params.capability;
      const devices = await storage.getDevicesByCapability(capability);
      return res.json(devices);
    } catch (error) {
      console.error("Error getting devices by capability:", error);
      return res.status(500).json({ message: "Error retrieving devices" });
    }
  });
  app2.get("/api/users/:userId/wellness-plans", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const plans = await storage.getWellnessPlansByUserId(userId);
    return res.json(plans);
  });
  app2.post("/api/wellness-plans", async (req, res) => {
    try {
      const validatedData = insertWellnessPlanSchema.parse(req.body);
      const plan = await storage.createWellnessPlan(validatedData);
      return res.status(201).json(plan);
    } catch (error) {
      return res.status(400).json({ message: "Invalid wellness plan data" });
    }
  });
  app2.get("/api/doctors", async (req, res) => {
    const specialty = req.query.specialty;
    const location = req.query.location;
    const doctorStorage = isConnected() ? mongoStorage : storage;
    if (specialty && location) {
      const doctors2 = await doctorStorage.getDoctorsBySpecialtyAndLocation(specialty, location);
      return res.json(doctors2);
    } else if (specialty) {
      const doctors2 = await doctorStorage.getDoctorsBySpecialty(specialty);
      return res.json(doctors2);
    } else if (location) {
      const doctors2 = await doctorStorage.getDoctorsByLocation(location);
      return res.json(doctors2);
    } else {
      const doctors2 = await doctorStorage.getAllDoctors();
      return res.json(doctors2);
    }
  });
  app2.get("/api/users/:userId/reminders", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const reminders2 = await storage.getRemindersByUserId(userId);
    return res.json(reminders2);
  });
  app2.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      return res.status(201).json(reminder);
    } catch (error) {
      return res.status(400).json({ message: "Invalid reminder data" });
    }
  });
  app2.put("/api/reminders/:id/complete", async (req, res) => {
    const reminderId = parseInt(req.params.id);
    const reminder = await storage.completeReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    return res.json(reminder);
  });
  app2.get("/api/users/:userId/goals", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const goals2 = await storage.getGoalsByUserId(userId);
    return res.json(goals2);
  });
  app2.post("/api/goals", async (req, res) => {
    try {
      console.log("Goal data received:", JSON.stringify(req.body));
      console.log("userId type:", typeof req.body.userId);
      console.log("userId value:", req.body.userId);
      if (!req.body.userId) {
        console.error("Missing userId in request");
        return res.status(400).json({ message: "Missing userId in request" });
      }
      if (!req.body.title) {
        console.error("Missing title in request");
        return res.status(400).json({ message: "Missing title in request" });
      }
      if (!req.body.target) {
        console.error("Missing target in request");
        return res.status(400).json({ message: "Missing target in request" });
      }
      if (!req.body.category) {
        console.error("Missing category in request");
        return res.status(400).json({ message: "Missing category in request" });
      }
      const goal = {
        userId: Number(req.body.userId),
        title: String(req.body.title),
        target: Number(req.body.target),
        current: req.body.current ? Number(req.body.current) : 0,
        unit: req.body.unit ? String(req.body.unit) : "",
        category: String(req.body.category),
        startDate: req.body.startDate ? new Date(req.body.startDate) : /* @__PURE__ */ new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      console.log("Manual goal object:", goal);
      const createdGoal = await storage.createGoal(goal);
      return res.status(201).json(goal);
    } catch (error) {
      const errorDetails = error.errors ? JSON.stringify(error.errors) : error.message || String(error);
      console.error("Goal validation error:", error);
      console.error("Goal validation error details:", errorDetails);
      console.error("Received goal data:", JSON.stringify(req.body));
      return res.status(400).json({
        message: "Invalid goal data",
        error: error?.message || String(error),
        details: error.errors || error.issues || null,
        receivedData: req.body
      });
    }
  });
  app2.put("/api/goals/:id/update-progress", async (req, res) => {
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
  app2.get("/api/users/:userId/ai-insights", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const insights = await storage.getAiInsightsByUserId(userId);
    return res.json(insights);
  });
  app2.post("/api/ai-insights", async (req, res) => {
    try {
      const validatedData = insertAiInsightSchema.parse(req.body);
      const insight = await storage.createAiInsight(validatedData);
      return res.status(201).json(insight);
    } catch (error) {
      return res.status(400).json({ message: "Invalid AI insight data" });
    }
  });
  app2.put("/api/ai-insights/:id/mark-read", async (req, res) => {
    const insightId = parseInt(req.params.id);
    const insight = await storage.markAiInsightAsRead(insightId);
    if (!insight) {
      return res.status(404).json({ message: "AI insight not found" });
    }
    return res.json(insight);
  });
  app2.get("/api/users/:userId/health-consultations", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const consultations = await storage.getHealthConsultationsByUserId(userId);
    return res.json(consultations);
  });
  app2.get("/api/health-consultations/:id", async (req, res) => {
    const consultationId = parseInt(req.params.id);
    const consultation = await storage.getHealthConsultation(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Health consultation not found" });
    }
    return res.json(consultation);
  });
  app2.post("/api/health-consultations", async (req, res) => {
    try {
      const validatedData = insertHealthConsultationSchema.parse(req.body);
      const consultation = await storage.createHealthConsultation(validatedData);
      return res.status(201).json(consultation);
    } catch (error) {
      return res.status(400).json({ message: "Invalid health consultation data" });
    }
  });
  app2.post("/api/health-coach/analyze-symptoms", async (req, res) => {
    const symptomsSchema = z.object({
      userId: z.number(),
      symptoms: z.string()
    });
    try {
      const { userId, symptoms } = symptomsSchema.parse(req.body);
      const analysis = await analyzeHealthSymptoms(userId, symptoms);
      const consultation = await storage.createHealthConsultation({
        userId,
        symptoms,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        severity: analysis.severity
      });
      return res.json(consultation);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      return res.status(400).json({ message: "Invalid symptom data or analysis error" });
    }
  });
  app2.post("/api/health-coach/chat", async (req, res) => {
    const chatSchema = z.object({
      userId: z.number(),
      message: z.string()
    });
    try {
      const { userId, message } = chatSchema.parse(req.body);
      const response = await chatWithHealthAssistant(userId, message);
      return res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      return res.status(400).json({ message: "Chat processing error" });
    }
  });
  app2.post("/api/demo/generate-data", async (req, res) => {
    const userId = 1;
    await storage.generateDemoData(userId);
    return res.json({ message: "Demo data generated successfully" });
  });
  app2.get("/api/system/health/database", async (req, res) => {
    try {
      const { checkMongoDBHealth: checkMongoDBHealth2 } = await Promise.resolve().then(() => (init_mongodb(), mongodb_exports));
      const healthStatus = await checkMongoDBHealth2();
      return res.json({
        service: "database",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ...healthStatus
      });
    } catch (error) {
      return res.status(500).json({
        service: "database",
        status: "error",
        connected: false,
        error: error.message || "Unknown error checking database health",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    let userId = null;
    ws2.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "register" && data.userId) {
          userId = Number(data.userId);
          if (!clients.has(userId)) {
            clients.set(userId, /* @__PURE__ */ new Set());
          }
          clients.get(userId)?.add(ws2);
          console.log(`WebSocket client registered for user ID: ${userId}`);
          sendPendingNotifications(userId, ws2);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket client disconnected");
      if (userId && clients.has(userId)) {
        clients.get(userId)?.delete(ws2);
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
      }
    });
    ws2.send(JSON.stringify({ type: "info", message: "Connected to healthcare notification service" }));
  });
  function sendNotification(userId, notification) {
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
  async function sendPendingNotifications(userId, ws2) {
    try {
      const reminders2 = await storage.getRemindersByUserId(userId);
      const pendingReminders = reminders2.filter((r) => !r.isCompleted);
      if (pendingReminders.length > 0) {
        if (ws2.readyState === WebSocket.OPEN) {
          ws2.send(JSON.stringify({
            type: "reminders",
            data: pendingReminders
          }));
        }
      }
      const insights = await storage.getAiInsightsByUserId(userId);
      const unreadInsights = insights.filter((i) => !i.isRead);
      if (unreadInsights.length > 0) {
        if (ws2.readyState === WebSocket.OPEN) {
          ws2.send(JSON.stringify({
            type: "insights",
            data: unreadInsights
          }));
        }
      }
    } catch (error) {
      console.error("Error sending pending notifications:", error);
    }
  }
  app2.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      try {
        if (req.method === "POST" && req.path === "/api/reminders" && res.statusCode === 201) {
          const reminder = JSON.parse(typeof body === "string" ? body : body.toString());
          if (reminder && reminder.userId) {
            sendNotification(reminder.userId, {
              type: "new_reminder",
              data: reminder
            });
          }
        } else if (req.method === "POST" && req.path === "/api/ai-insights" && res.statusCode === 201) {
          const insight = JSON.parse(typeof body === "string" ? body : body.toString());
          if (insight && insight.userId) {
            sendNotification(insight.userId, {
              type: "new_insight",
              data: insight
            });
          }
        }
      } catch (error) {
        console.error("Error in notification middleware:", error);
      }
      return originalSend.call(this, body);
    };
    next();
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  base: "/"
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options2) => {
        viteLogger.error(msg, options2);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_security();
init_mongodb();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(requireTLS);
app.use(auditLogMiddleware);
if (process.env.NODE_ENV === "production") {
  app.use(sessionTimeout(15));
  console.log("Session timeout middleware enabled for production");
}
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  connectToDatabase().then(() => {
    log("MongoDB connection initialized");
  }).catch((error) => {
    log("Failed to connect to MongoDB, using in-memory storage as fallback");
    console.error("MongoDB connection error:", error);
  });
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
