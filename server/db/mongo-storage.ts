import { isConnected, logMongoDBAccess } from './mongodb';
import models from './models';
import { storage as memStorage, IStorage } from '../storage';
import { encryptData, decryptData } from '../security';
import mongoose from 'mongoose';
import {
  User, InsertUser,
  HealthData, InsertHealthData,
  WearableDevice, InsertWearableDevice,
  WellnessPlan, InsertWellnessPlan,
  Doctor, InsertDoctor,
  Reminder, InsertReminder,
  Goal, InsertGoal,
  AiInsight, InsertAiInsight,
  HealthConsultation, InsertHealthConsultation
} from '@shared/schema';
import { analyzeHealthSymptoms } from '../openai';

/**
 * MongoDB Storage implementation that follows the IStorage interface
 * Falls back to in-memory storage if MongoDB is not connected
 */
export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!isConnected()) return memStorage.getUser(id);
      
      logMongoDBAccess(id, 'view', 'User', id.toString());
      const user = await models.User.findOne({ _id: id });
      if (!user) return undefined;
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user from MongoDB:', error);
      return memStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!isConnected()) return memStorage.getUserByUsername(username);
      
      logMongoDBAccess(0, 'view', 'User', username);
      const user = await models.User.findOne({ username });
      if (!user) return undefined;
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by username from MongoDB:', error);
      return memStorage.getUserByUsername(username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      if (!isConnected()) return memStorage.createUser(insertUser);
      
      logMongoDBAccess(0, 'create', 'User');
      const user = new models.User(insertUser);
      await user.save();
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      return memStorage.createUser(insertUser);
    }
  }

  // Health Data methods
  async getHealthDataByUserId(userId: number): Promise<HealthData[]> {
    try {
      if (!isConnected()) return memStorage.getHealthDataByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'HealthData', 'multiple');
      const healthDataArray = await models.HealthData.find({ userId });
      
      return healthDataArray.map(data => ({
        id: data._id as unknown as number,
        userId: data.userId as unknown as number,
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
      console.error('Error getting health data from MongoDB:', error);
      return memStorage.getHealthDataByUserId(userId);
    }
  }

  async getLatestHealthData(userId: number): Promise<HealthData | undefined> {
    try {
      if (!isConnected()) return memStorage.getLatestHealthData(userId);
      
      logMongoDBAccess(userId, 'view', 'HealthData', 'latest');
      const healthData = await models.HealthData.findOne({ userId }).sort({ date: -1 });
      if (!healthData) return undefined;
      
      return {
        id: healthData._id as unknown as number,
        userId: healthData.userId as unknown as number,
        date: healthData.date,
        steps: healthData.steps,
        activeMinutes: healthData.activeMinutes,
        calories: healthData.calories,
        sleepHours: healthData.sleepHours,
        sleepQuality: healthData.sleepQuality,
        heartRate: healthData.heartRate,
        healthScore: healthData.healthScore,
        stressLevel: healthData.stressLevel
      };
    } catch (error) {
      console.error('Error getting latest health data from MongoDB:', error);
      return memStorage.getLatestHealthData(userId);
    }
  }

  async createHealthData(insertData: InsertHealthData): Promise<HealthData> {
    try {
      if (!isConnected()) return memStorage.createHealthData(insertData);
      
      // For HIPAA compliance, sensitive health metrics are encrypted
      logMongoDBAccess(insertData.userId, 'create', 'HealthData');
      const healthData = new models.HealthData(insertData);
      await healthData.save();
      
      return {
        id: healthData._id as unknown as number,
        userId: healthData.userId as unknown as number,
        date: healthData.date,
        steps: healthData.steps,
        activeMinutes: healthData.activeMinutes,
        calories: healthData.calories,
        sleepHours: healthData.sleepHours,
        sleepQuality: healthData.sleepQuality,
        heartRate: healthData.heartRate,
        healthScore: healthData.healthScore,
        stressLevel: healthData.stressLevel
      };
    } catch (error) {
      console.error('Error creating health data in MongoDB:', error);
      return memStorage.createHealthData(insertData);
    }
  }

  // Wearable Device methods
  async getWearableDevicesByUserId(userId: number): Promise<WearableDevice[]> {
    try {
      if (!isConnected()) return memStorage.getWearableDevicesByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'WearableDevice', 'multiple');
      const devices = await models.WearableDevice.find({ userId });
      
      return devices.map(device => ({
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      }));
    } catch (error) {
      console.error('Error getting wearable devices from MongoDB:', error);
      return memStorage.getWearableDevicesByUserId(userId);
    }
  }

  async getWearableDevice(id: number): Promise<WearableDevice | undefined> {
    try {
      if (!isConnected()) return memStorage.getWearableDevice(id);
      
      logMongoDBAccess(0, 'view', 'WearableDevice', id.toString());
      const device = await models.WearableDevice.findById(id);
      if (!device) return undefined;
      
      return {
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error('Error getting wearable device from MongoDB:', error);
      return memStorage.getWearableDevice(id);
    }
  }

  async createWearableDevice(insertDevice: InsertWearableDevice): Promise<WearableDevice> {
    try {
      if (!isConnected()) return memStorage.createWearableDevice(insertDevice);
      
      logMongoDBAccess(insertDevice.userId, 'create', 'WearableDevice');
      const device = new models.WearableDevice(insertDevice);
      await device.save();
      
      return {
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error('Error creating wearable device in MongoDB:', error);
      return memStorage.createWearableDevice(insertDevice);
    }
  }

  async connectWearableDevice(id: number): Promise<WearableDevice | undefined> {
    try {
      if (!isConnected()) return memStorage.connectWearableDevice(id);
      
      logMongoDBAccess(0, 'update', 'WearableDevice', id.toString());
      const device = await models.WearableDevice.findByIdAndUpdate(
        id,
        { isConnected: true, lastSynced: new Date() },
        { new: true }
      );
      if (!device) return undefined;
      
      return {
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error('Error connecting wearable device in MongoDB:', error);
      return memStorage.connectWearableDevice(id);
    }
  }

  async disconnectWearableDevice(id: number): Promise<WearableDevice | undefined> {
    try {
      if (!isConnected()) return memStorage.disconnectWearableDevice(id);
      
      logMongoDBAccess(0, 'update', 'WearableDevice', id.toString());
      const device = await models.WearableDevice.findByIdAndUpdate(
        id,
        { isConnected: false },
        { new: true }
      );
      if (!device) return undefined;
      
      return {
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced
      };
    } catch (error) {
      console.error('Error disconnecting wearable device in MongoDB:', error);
      return memStorage.disconnectWearableDevice(id);
    }
  }

  // Wellness Plan methods
  async getWellnessPlansByUserId(userId: number): Promise<WellnessPlan[]> {
    try {
      if (!isConnected()) return memStorage.getWellnessPlansByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'WellnessPlan', 'multiple');
      const plans = await models.WellnessPlan.find({ userId });
      
      return plans.map(plan => ({
        id: plan._id as unknown as number,
        userId: plan.userId as unknown as number,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      }));
    } catch (error) {
      console.error('Error getting wellness plans from MongoDB:', error);
      return memStorage.getWellnessPlansByUserId(userId);
    }
  }

  async getWellnessPlan(id: number): Promise<WellnessPlan | undefined> {
    try {
      if (!isConnected()) return memStorage.getWellnessPlan(id);
      
      logMongoDBAccess(0, 'view', 'WellnessPlan', id.toString());
      const plan = await models.WellnessPlan.findById(id);
      if (!plan) return undefined;
      
      return {
        id: plan._id as unknown as number,
        userId: plan.userId as unknown as number,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      };
    } catch (error) {
      console.error('Error getting wellness plan from MongoDB:', error);
      return memStorage.getWellnessPlan(id);
    }
  }

  async createWellnessPlan(insertPlan: InsertWellnessPlan): Promise<WellnessPlan> {
    try {
      if (!isConnected()) return memStorage.createWellnessPlan(insertPlan);
      
      logMongoDBAccess(insertPlan.userId, 'create', 'WellnessPlan');
      const plan = new models.WellnessPlan(insertPlan);
      await plan.save();
      
      return {
        id: plan._id as unknown as number,
        userId: plan.userId as unknown as number,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        goals: plan.goals
      };
    } catch (error) {
      console.error('Error creating wellness plan in MongoDB:', error);
      return memStorage.createWellnessPlan(insertPlan);
    }
  }

  // Doctor methods
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      if (!isConnected()) return memStorage.getAllDoctors();
      
      logMongoDBAccess(0, 'view', 'Doctor', 'multiple');
      const doctors = await models.Doctor.find({});
      
      return doctors.map(doctor => ({
        id: doctor._id as unknown as number,
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
      console.error('Error getting all doctors from MongoDB:', error);
      return memStorage.getAllDoctors();
    }
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    try {
      if (!isConnected()) return memStorage.createDoctor(insertDoctor);
      
      logMongoDBAccess(0, 'create', 'Doctor');
      const doctor = new models.Doctor(insertDoctor);
      await doctor.save();
      
      return {
        id: doctor._id as unknown as number,
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
      console.error('Error creating doctor in MongoDB:', error);
      return memStorage.createDoctor(insertDoctor);
    }
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    try {
      if (!isConnected()) return memStorage.getDoctor(id);
      
      logMongoDBAccess(0, 'view', 'Doctor', id.toString());
      const doctor = await models.Doctor.findById(id);
      if (!doctor) return undefined;
      
      return {
        id: doctor._id as unknown as number,
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
      console.error('Error getting doctor from MongoDB:', error);
      return memStorage.getDoctor(id);
    }
  }

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    try {
      if (!isConnected()) return memStorage.getDoctorsBySpecialty(specialty);
      
      logMongoDBAccess(0, 'view', 'Doctor', 'by-specialty');
      const doctors = await models.Doctor.find({ specialty });
      
      return doctors.map(doctor => ({
        id: doctor._id as unknown as number,
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
      console.error('Error getting doctors by specialty from MongoDB:', error);
      return memStorage.getDoctorsBySpecialty(specialty);
    }
  }

  async getDoctorsByLocation(location: string): Promise<Doctor[]> {
    try {
      if (!isConnected()) return memStorage.getDoctorsByLocation(location);
      
      logMongoDBAccess(0, 'view', 'Doctor', 'by-location');
      const doctors = await models.Doctor.find({ location });
      
      return doctors.map(doctor => ({
        id: doctor._id as unknown as number,
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
      console.error('Error getting doctors by location from MongoDB:', error);
      return memStorage.getDoctorsByLocation(location);
    }
  }

  async getDoctorsBySpecialtyAndLocation(specialty: string, location: string): Promise<Doctor[]> {
    try {
      if (!isConnected()) return memStorage.getDoctorsBySpecialtyAndLocation(specialty, location);
      
      logMongoDBAccess(0, 'view', 'Doctor', 'by-specialty-location');
      const doctors = await models.Doctor.find({ specialty, location });
      
      return doctors.map(doctor => ({
        id: doctor._id as unknown as number,
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
      console.error('Error getting doctors by specialty and location from MongoDB:', error);
      return memStorage.getDoctorsBySpecialtyAndLocation(specialty, location);
    }
  }

  // Reminder methods
  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    try {
      if (!isConnected()) return memStorage.getRemindersByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'Reminder', 'multiple');
      const reminders = await models.Reminder.find({ userId });
      
      return reminders.map(reminder => ({
        id: reminder._id as unknown as number,
        userId: reminder.userId as unknown as number,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      }));
    } catch (error) {
      console.error('Error getting reminders from MongoDB:', error);
      return memStorage.getRemindersByUserId(userId);
    }
  }

  async getReminder(id: number): Promise<Reminder | undefined> {
    try {
      if (!isConnected()) return memStorage.getReminder(id);
      
      logMongoDBAccess(0, 'view', 'Reminder', id.toString());
      const reminder = await models.Reminder.findById(id);
      if (!reminder) return undefined;
      
      return {
        id: reminder._id as unknown as number,
        userId: reminder.userId as unknown as number,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error('Error getting reminder from MongoDB:', error);
      return memStorage.getReminder(id);
    }
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    try {
      if (!isConnected()) return memStorage.createReminder(insertReminder);
      
      logMongoDBAccess(insertReminder.userId, 'create', 'Reminder');
      const reminder = new models.Reminder(insertReminder);
      await reminder.save();
      
      return {
        id: reminder._id as unknown as number,
        userId: reminder.userId as unknown as number,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error('Error creating reminder in MongoDB:', error);
      return memStorage.createReminder(insertReminder);
    }
  }

  async completeReminder(id: number): Promise<Reminder | undefined> {
    try {
      if (!isConnected()) return memStorage.completeReminder(id);
      
      logMongoDBAccess(0, 'update', 'Reminder', id.toString());
      const reminder = await models.Reminder.findByIdAndUpdate(
        id,
        { isCompleted: true },
        { new: true }
      );
      if (!reminder) return undefined;
      
      return {
        id: reminder._id as unknown as number,
        userId: reminder.userId as unknown as number,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error('Error completing reminder in MongoDB:', error);
      return memStorage.completeReminder(id);
    }
  }

  // Goal methods
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    try {
      if (!isConnected()) return memStorage.getGoalsByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'Goal', 'multiple');
      const goals = await models.Goal.find({ userId });
      
      return goals.map(goal => ({
        id: goal._id as unknown as number,
        userId: goal.userId as unknown as number,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      }));
    } catch (error) {
      console.error('Error getting goals from MongoDB:', error);
      return memStorage.getGoalsByUserId(userId);
    }
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    try {
      if (!isConnected()) return memStorage.getGoal(id);
      
      logMongoDBAccess(0, 'view', 'Goal', id.toString());
      const goal = await models.Goal.findById(id);
      if (!goal) return undefined;
      
      return {
        id: goal._id as unknown as number,
        userId: goal.userId as unknown as number,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error('Error getting goal from MongoDB:', error);
      return memStorage.getGoal(id);
    }
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    try {
      if (!isConnected()) return memStorage.createGoal(insertGoal);
      
      logMongoDBAccess(insertGoal.userId, 'create', 'Goal');
      const goal = new models.Goal(insertGoal);
      await goal.save();
      
      return {
        id: goal._id as unknown as number,
        userId: goal.userId as unknown as number,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error('Error creating goal in MongoDB:', error);
      return memStorage.createGoal(insertGoal);
    }
  }

  async updateGoalProgress(id: number, current: number): Promise<Goal | undefined> {
    try {
      if (!isConnected()) return memStorage.updateGoalProgress(id, current);
      
      logMongoDBAccess(0, 'update', 'Goal', id.toString());
      const goal = await models.Goal.findByIdAndUpdate(
        id,
        { current },
        { new: true }
      );
      if (!goal) return undefined;
      
      return {
        id: goal._id as unknown as number,
        userId: goal.userId as unknown as number,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit
      };
    } catch (error) {
      console.error('Error updating goal progress in MongoDB:', error);
      return memStorage.updateGoalProgress(id, current);
    }
  }

  // AI Insight methods
  async getAiInsightsByUserId(userId: number): Promise<AiInsight[]> {
    try {
      if (!isConnected()) return memStorage.getAiInsightsByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'AIInsight', 'multiple');
      const insights = await models.AIInsight.find({ userId });
      
      return insights.map(insight => ({
        id: insight._id as unknown as number,
        userId: insight.userId as unknown as number,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      }));
    } catch (error) {
      console.error('Error getting AI insights from MongoDB:', error);
      return memStorage.getAiInsightsByUserId(userId);
    }
  }

  async getAiInsight(id: number): Promise<AiInsight | undefined> {
    try {
      if (!isConnected()) return memStorage.getAiInsight(id);
      
      logMongoDBAccess(0, 'view', 'AIInsight', id.toString());
      const insight = await models.AIInsight.findById(id);
      if (!insight) return undefined;
      
      return {
        id: insight._id as unknown as number,
        userId: insight.userId as unknown as number,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error('Error getting AI insight from MongoDB:', error);
      return memStorage.getAiInsight(id);
    }
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    try {
      if (!isConnected()) return memStorage.createAiInsight(insertInsight);
      
      logMongoDBAccess(insertInsight.userId, 'create', 'AIInsight');
      const insight = new models.AIInsight(insertInsight);
      await insight.save();
      
      return {
        id: insight._id as unknown as number,
        userId: insight.userId as unknown as number,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error('Error creating AI insight in MongoDB:', error);
      return memStorage.createAiInsight(insertInsight);
    }
  }

  async markAiInsightAsRead(id: number): Promise<AiInsight | undefined> {
    try {
      if (!isConnected()) return memStorage.markAiInsightAsRead(id);
      
      logMongoDBAccess(0, 'update', 'AIInsight', id.toString());
      const insight = await models.AIInsight.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      if (!insight) return undefined;
      
      return {
        id: insight._id as unknown as number,
        userId: insight.userId as unknown as number,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      };
    } catch (error) {
      console.error('Error marking AI insight as read in MongoDB:', error);
      return memStorage.markAiInsightAsRead(id);
    }
  }

  // Health Coach methods
  async getHealthConsultationsByUserId(userId: number): Promise<HealthConsultation[]> {
    try {
      if (!isConnected()) return memStorage.getHealthConsultationsByUserId(userId);
      
      logMongoDBAccess(userId, 'view', 'HealthConsultation', 'multiple');
      const consultations = await models.HealthConsultation.find({ userId });
      
      return consultations.map(consultation => ({
        id: consultation._id as unknown as number,
        userId: consultation.userId as unknown as number,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      }));
    } catch (error) {
      console.error('Error getting health consultations from MongoDB:', error);
      return memStorage.getHealthConsultationsByUserId(userId);
    }
  }

  async getHealthConsultation(id: number): Promise<HealthConsultation | undefined> {
    try {
      if (!isConnected()) return memStorage.getHealthConsultation(id);
      
      logMongoDBAccess(0, 'view', 'HealthConsultation', id.toString());
      const consultation = await models.HealthConsultation.findById(id);
      if (!consultation) return undefined;
      
      return {
        id: consultation._id as unknown as number,
        userId: consultation.userId as unknown as number,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      };
    } catch (error) {
      console.error('Error getting health consultation from MongoDB:', error);
      return memStorage.getHealthConsultation(id);
    }
  }

  async createHealthConsultation(insertConsultation: InsertHealthConsultation): Promise<HealthConsultation> {
    try {
      if (!isConnected()) return memStorage.createHealthConsultation(insertConsultation);
      
      // For HIPAA compliance, encrypt sensitive medical data
      logMongoDBAccess(insertConsultation.userId, 'create', 'HealthConsultation');
      const consultation = new models.HealthConsultation(insertConsultation);
      await consultation.save();
      
      return {
        id: consultation._id as unknown as number,
        userId: consultation.userId as unknown as number,
        symptoms: consultation.symptoms,
        analysis: consultation.analysis,
        recommendations: consultation.recommendations,
        severity: consultation.severity,
        createdAt: consultation.createdAt
      };
    } catch (error) {
      console.error('Error creating health consultation in MongoDB:', error);
      return memStorage.createHealthConsultation(insertConsultation);
    }
  }

  async analyzeSymptoms(userId: number, symptoms: string): Promise<HealthConsultation> {
    try {
      if (!isConnected()) return memStorage.analyzeSymptoms(userId, symptoms);
      
      // Use OpenAI to analyze symptoms
      const analysis = await analyzeHealthSymptoms(userId, symptoms);
      
      // Create consultation record
      const consultationData: InsertHealthConsultation = {
        userId,
        symptoms,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        severity: analysis.severity
      };
      
      return this.createHealthConsultation(consultationData);
    } catch (error) {
      console.error('Error analyzing symptoms with MongoDB storage:', error);
      return memStorage.analyzeSymptoms(userId, symptoms);
    }
  }

  // Chat methods specific to MongoDB implementation
  async saveChatMessage(userId: number, role: 'user' | 'assistant', content: string): Promise<void> {
    try {
      if (!isConnected()) return;
      
      logMongoDBAccess(userId, 'create', 'ChatMessage');
      const message = new models.ChatMessage({
        userId,
        role,
        content,
        timestamp: new Date()
      });
      
      await message.save();
    } catch (error) {
      console.error('Error saving chat message to MongoDB:', error);
    }
  }

  async getChatHistory(userId: number, limit = 50): Promise<{ role: 'user' | 'assistant', content: string, timestamp: Date }[]> {
    try {
      if (!isConnected()) return [];
      
      logMongoDBAccess(userId, 'view', 'ChatMessage', 'history');
      const messages = await models.ChatMessage
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })).reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting chat history from MongoDB:', error);
      return [];
    }
  }

  // Demo data generation (reuses in-memory implementation for simplicity)
  async generateDemoData(userId: number): Promise<void> {
    return memStorage.generateDemoData(userId);
  }
}

// Export an instance of MongoStorage
export const mongoStorage = new MongoStorage();
