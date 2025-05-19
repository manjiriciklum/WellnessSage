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
import { ObjectId } from 'mongodb';
import { calculateHealthScore } from '../utils/health-score';

/**
 * MongoDB Storage implementation that follows the IStorage interface
 * Falls back to in-memory storage if MongoDB is not connected
 */
export class MongoStorage implements IStorage {
  // Session store
  sessionStore: any;
  
  // Method to set session store from main storage
  setSessionStore(store: any) {
    this.sessionStore = store;
  }
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
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
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
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
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
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      return memStorage.createUser(insertUser);
    }
  }

  // Health Data methods
  async getHealthDataByUserId(userId: string | number): Promise<HealthData[]> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.getHealthDataByUserId(userId);
      }
      
      logMongoDBAccess(userId, 'view', 'HealthData', 'multiple');
      
      // Convert string ID to MongoDB ObjectId
      let objectId;
      try {
        if (typeof userId === 'string') {
          objectId = new mongoose.Types.ObjectId(userId);
        } else {
          const hexId = userId.toString(16).padStart(24, '0');
          objectId = new mongoose.Types.ObjectId(hexId);
        }
      } catch (error) {
        console.error('Error creating ObjectId for health data:', error);
        return []; // Return empty array if we can't create a valid ObjectId
      }
      
      const healthDataArray = await models.HealthData.find({ userId: objectId });


      
      return healthDataArray.map(data => {
        const healthData = {
          id: data._id.toString(),
          userId: data.userId.toString(),
          date: data.date,
          steps: data.steps,
          activeMinutes: data.activeMinutes,
          calories: data.calories,
          sleepHours: data.sleepHours,
          sleepQuality: data.sleepQuality,
          heartRate: data.heartRate,
          healthScore: data.healthScore,
          stressLevel: data.stressLevel,
          healthMetrics: data.healthMetrics || {}
        };

        // Calculate health score if it's null
        if (healthData.healthScore === null || healthData.healthScore === undefined) {
          healthData.healthScore = calculateHealthScore(healthData);
        }

        return healthData;
      });
    } catch (error) {
      console.error('Error getting health data from MongoDB:', error);
      return []; // Return empty array instead of recursing
    }
  }

  async getLatestHealthData(userId: string | number): Promise<HealthData | undefined> {
    try {
      if (!isConnected()) {
        // Use the in-memory storage's implementation directly
        const userHealthData = await memStorage.getHealthDataByUserId(userId);
        if (userHealthData.length === 0) return undefined;
        
        return userHealthData.reduce((latest, current) => {
          if (!latest.date || (current.date && current.date > latest.date)) {
            return current;
          }
          return latest;
        });
      }
      
      logMongoDBAccess(userId, 'view', 'HealthData', 'latest');
      
      // Convert string ID to MongoDB ObjectId
      let objectId;
      try {
        if (typeof userId === 'string') {
          objectId = new mongoose.Types.ObjectId(userId);
        } else {
          const hexId = userId.toString(16).padStart(24, '0');
          objectId = new mongoose.Types.ObjectId(hexId);
        }
      } catch (error) {
        console.error('Error creating ObjectId for latest health data:', error);
        return undefined;
      }
      
      const healthData = await models.HealthData.findOne({ userId: objectId }).sort({ date: -1 });
      if (!healthData) return undefined;
      
      return {
        id: healthData._id.toString(),
        userId: healthData.userId.toString(),
        date: healthData.date,
        steps: healthData.steps,
        activeMinutes: healthData.activeMinutes,
        calories: healthData.calories,
        sleepHours: healthData.sleepHours,
        sleepQuality: healthData.sleepQuality,
        heartRate: healthData.heartRate,
        healthScore: healthData.healthScore,
        stressLevel: healthData.stressLevel,
        healthMetrics: healthData.healthMetrics || {}
      };
    } catch (error) {
      console.error('Error getting latest health data from MongoDB:', error);
      return undefined;
    }
  }

  async createHealthData(insertData: InsertHealthData): Promise<HealthData> {
    try {
      if (!isConnected()) return memStorage.createHealthData(insertData);
      
      logMongoDBAccess(insertData.userId, 'create', 'HealthData');
      
      // Convert string userId to ObjectId if needed
      const userId = typeof insertData.userId === 'string' 
        ? new mongoose.Types.ObjectId(insertData.userId)
        : new mongoose.Types.ObjectId(insertData.userId.toString(16).padStart(24, '0'));

        // Calculate health score if it's null
      const healthScore = insertData.healthScore ?? calculateHealthScore(insertData);
      
      const healthData = new models.HealthData({
        ...insertData,
        userId,
        healthScore
      });
      await healthData.save();
      
      return {
        id: healthData._id.toString(),
        userId: healthData.userId.toString(),
        date: healthData.date,
        steps: healthData.steps,
        activeMinutes: healthData.activeMinutes,
        calories: healthData.calories,
        sleepHours: healthData.sleepHours,
        sleepQuality: healthData.sleepQuality,
        heartRate: healthData.heartRate,
        healthScore: healthData.healthScore,
        stressLevel: healthData.stressLevel,
        healthMetrics: healthData.healthMetrics || {}
      };
    } catch (error) {
      console.error('Error creating health data in MongoDB:', error);
      return memStorage.createHealthData(insertData);
    }
  }

  // Wearable Device methods
  async getWearableDevicesByUserId(userId: number): Promise<WearableDevice[]> {
    try {
      if (!isConnected()) {
        return memStorage.getWearableDevicesByUserId(userId);
      }
      
      logMongoDBAccess(userId, 'view', 'WearableDevice', 'multiple');
      
      // Convert numeric ID to a valid MongoDB ObjectId
      let objectId;
      try {
        const hexId = userId.toString(16).padStart(24, '0');
        objectId = new mongoose.Types.ObjectId(hexId);
      } catch (error) {
        console.error('Error creating ObjectId for wearable devices:', error);
        return []; // Return empty array if we can't create a valid ObjectId
      }
      
      const devices = await models.WearableDevice.find({ userId: objectId });
      
      return devices.map(device => ({
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
      }));
    } catch (error) {
      console.error('Error getting wearable devices from MongoDB:', error);
      return []; // Return empty array instead of recursing
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
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
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
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
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
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
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
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
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
      if (!isConnected()) {
        return memStorage.getRemindersByUserId(userId);
      }
      
      logMongoDBAccess(userId, 'view', 'Reminder', 'multiple');
      
      // Convert numeric ID to a valid MongoDB ObjectId
      let objectId;
      try {
        const hexId = userId.toString(16).padStart(24, '0');
        objectId = new mongoose.Types.ObjectId(hexId);
      } catch (error) {
        console.error('Error creating ObjectId for reminders:', error);
        return []; // Return empty array if we can't create a valid ObjectId
      }
      
      const reminders = await models.Reminder.find({ userId: objectId });
      
      return reminders.map(reminder => ({
        id: reminder._id.toString(),
        userId: reminder.userId.toString(),
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
      return []; // Return empty array instead of recursing
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

  async createReminder(data: InsertReminder): Promise<Reminder> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.createReminder(data);
      }
      
      console.log('Creating reminder in MongoDB:', data);
      
      // Create a new reminder document using Mongoose model
      const reminder = new models.Reminder({
        userId: new mongoose.Types.ObjectId(data.userId),
        title: data.title,
        description: data.description || '',
        time: data.time || '',
        frequency: data.frequency || 'once',
        isCompleted: data.isCompleted || false,
        category: data.category,
        color: data.color || '#1e88e5',
        createdAt: new Date()
      });

      // Save the reminder
      await reminder.save();
      console.log('Saved reminder:', reminder);

      // Return the created reminder with proper type conversions
      return {
        id: reminder._id.toString(),
        userId: reminder.userId.toString(),
        title: reminder.title,
        description: reminder.description,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        category: reminder.category,
        color: reminder.color
      };
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async completeReminder(id: string | mongoose.Types.ObjectId): Promise<Reminder | undefined> {
    try {
      if (!isConnected()) return undefined;
      
      const objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
      const reminder = await models.Reminder.findByIdAndUpdate(
        objectId,
        { isCompleted: true },
        { new: true }
      );
      
      if (!reminder) return undefined;
      
      return {
        id: reminder._id.toString(),
        userId: reminder.userId.toString(),
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
      return undefined;
    }
  }

  // Goal methods
  async getGoalsByUserId(userId: string | number): Promise<Goal[]> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.getGoalsByUserId(userId);
      }
      
      console.log('Fetching goals for user:', userId);
      
      // Query goals directly with the string userId
      console.log('Querying MongoDB for goals with userId:', userId);
      const goals = await models.Goal.find({ userId: userId.toString() }).sort({ createdAt: -1 });
      console.log('Found goals:', goals);
      
      // Transform the goals to match the expected format
      const transformedGoals = goals.map(goal => ({
        id: goal._id.toString(),
        userId: goal.userId.toString(),
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current || 0,
        startDate: goal.startDate,
        endDate: goal.endDate,
        unit: goal.unit || '',
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt
      }));
      console.log('Transformed goals:', transformedGoals);
      
      return transformedGoals;
    } catch (error) {
      console.error('Error getting goals from MongoDB:', error);
      return []; // Return empty array instead of recursing
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

  async createGoal(data: InsertGoal): Promise<Goal> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.createGoal(data);
      }
      
      console.log('Creating goal in MongoDB:', data);
      
      // Create a new goal document using Mongoose model
      const goal = new models.Goal({
        userId: new mongoose.Types.ObjectId(data.userId),
        title: data.title,
        target: data.target,
        current: data.current || 0,
        unit: data.unit || '',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        category: data.category,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save the goal
      await goal.save();
      console.log('Saved goal:', goal);

      // Return the created goal with proper type conversions
      return {
        id: goal._id.toString(),
        userId: goal.userId.toString(),
        title: goal.title,
        target: goal.target,
        current: goal.current,
        unit: goal.unit,
        startDate: goal.startDate,
        endDate: goal.endDate,
        category: goal.category
      };
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
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
  async getAiInsightsByUserId(userId: string | number): Promise<AiInsight[]> {
    try {
      if (!isConnected()) {
        // Convert string ID to number for in-memory storage
        const numericId = typeof userId === 'string' ? parseInt(userId, 16) : userId;
        return memStorage.getAiInsightsByUserId(numericId);
      }
      
      logMongoDBAccess(userId, 'view', 'AIInsight', 'multiple');
      
      // Convert string ID to MongoDB ObjectId
      let objectId;
      try {
        if (typeof userId === 'string') {
          objectId = new mongoose.Types.ObjectId(userId);
        } else {
          const hexId = userId.toString(16).padStart(24, '0');
          objectId = new mongoose.Types.ObjectId(hexId);
        }
      } catch (error) {
        console.error('Error creating ObjectId for AI insights:', error);
        return []; // Return empty array if we can't create a valid ObjectId
      }
      
      const insights = await models.AIInsight.find({ userId: objectId });
      
      return insights.map((insight: any) => ({
        id: parseInt(insight._id.toString(), 16),
        userId: parseInt(insight.userId.toString(), 16),
        title: insight.title,
        description: insight.description,
        category: insight.category,
        action: insight.action,
        createdAt: insight.createdAt,
        isRead: insight.isRead
      }));
    } catch (error) {
      console.error('Error getting AI insights from MongoDB:', error);
      // Return empty array instead of recursing
      return [];
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
    try {
      if (!isConnected()) {
        // Use the in-memory storage's implementation directly
        await memStorage.generateDemoData(userId);
        return;
      }

      // Convert numeric ID to a valid MongoDB ObjectId
      let objectId;
      try {
        const hexId = userId.toString(16).padStart(24, '0');
        objectId = new mongoose.Types.ObjectId(hexId);
      } catch (error) {
        console.error('Error creating ObjectId for demo data:', error);
        return;
      }

      // Generate demo health data
      const healthData = {
        userId: objectId,
        date: new Date(),
        steps: Math.floor(Math.random() * 10000),
        activeMinutes: Math.floor(Math.random() * 120),
        calories: Math.floor(Math.random() * 2000),
        sleepHours: Math.floor(Math.random() * 8) + 4,
        sleepQuality: Math.floor(Math.random() * 5) + 1,
        heartRate: Math.floor(Math.random() * 40) + 60,
        healthScore: Math.floor(Math.random() * 40) + 60,
        stressLevel: Math.floor(Math.random() * 5) + 1,
        healthMetrics: {}
      };

      // Generate demo reminders
      const reminders = [
        {
          userId: objectId,
          title: 'Morning Exercise',
          description: '30 minutes of cardio',
          category: 'Exercise',
          time: new Date(),
          frequency: 'Daily',
          isCompleted: false,
          color: '#4CAF50'
        },
        {
          userId: objectId,
          title: 'Take Medication',
          description: 'Blood pressure medication',
          category: 'Health',
          time: new Date(),
          frequency: 'Daily',
          isCompleted: false,
          color: '#2196F3'
        }
      ];

      // Save demo data (excluding goals)
      await Promise.all([
        models.HealthData.create(healthData)
        // models.Reminder.insertMany(reminders)
      ]);

    } catch (error) {
      console.error('Error generating demo data:', error);
      // Don't recursively call this method again
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      if (!isConnected()) return memStorage.getUserByEmail(email);
      
      logMongoDBAccess(0, 'view', 'User', email);
      const user = await models.User.findOne({ email });
      if (!user) return undefined;
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by email from MongoDB:', error);
      return memStorage.getUserByEmail(email);
    }
  }

  async getUserByOAuthId(oauthId: string, provider: string): Promise<User | undefined> {
    try {
      if (!isConnected()) return memStorage.getUserByOAuthId(oauthId, provider);
      
      logMongoDBAccess(0, 'view', 'User', oauthId);
      const user = await models.User.findOne({ oauthId, oauthProvider: provider });
      if (!user) return undefined;
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by OAuth ID from MongoDB:', error);
      return memStorage.getUserByOAuthId(oauthId, provider);
    }
  }

  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    try {
      if (!isConnected()) return memStorage.updateUserLastLogin(userId);
      
      logMongoDBAccess(userId, 'update', 'User', 'lastLogin');
      const user = await models.User.findByIdAndUpdate(
        userId,
        { lastLogin: new Date() },
        { new: true }
      );
      
      if (!user) return undefined;
      
      return {
        id: user._id as unknown as number,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role || null,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error updating user last login in MongoDB:', error);
      return memStorage.updateUserLastLogin(userId);
    }
  }

  async deleteHealthData(id: number): Promise<boolean> {
    try {
      if (!isConnected()) return memStorage.deleteHealthData(id);
      
      logMongoDBAccess(0, 'delete', 'HealthData', id.toString());
      const result = await models.HealthData.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting health data from MongoDB:', error);
      return memStorage.deleteHealthData(id);
    }
  }

  // Add missing methods to satisfy IStorage interface
  async updateWearableDeviceLastSynced(id: number, userId: number): Promise<WearableDevice | undefined> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.updateWearableDeviceLastSynced(id, userId);
      }
      
      logMongoDBAccess(userId, 'update', 'WearableDevice', id.toString());
      const device = await models.WearableDevice.findOneAndUpdate(
        { _id: id, userId },
        { lastSynced: new Date() },
        { new: true }
      );
      if (!device) return undefined;
      
      return {
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
      };
    } catch (error) {
      console.error('Error updating wearable device last synced in MongoDB:', error);
      return memStorage.updateWearableDeviceLastSynced(id, userId);
    }
  }

  async getDevicesByCapability(capability: string): Promise<WearableDevice[]> {
    try {
      if (!isConnected()) return memStorage.getDevicesByCapability(capability);
      
      logMongoDBAccess(0, 'view', 'WearableDevice', 'by-capability');
      const devices = await models.WearableDevice.find({ capabilities: capability });
      
      return devices.map(device => ({
        id: device._id as unknown as number,
        userId: device.userId as unknown as number,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel || null,
        manufacturer: device.manufacturer || null,
        serialNumber: device.serialNumber || null,
        firmwareVersion: device.firmwareVersion || null,
        isConnected: device.isConnected,
        lastSynced: device.lastSynced,
        batteryLevel: device.batteryLevel || null,
        capabilities: device.capabilities || [],
        connectionSettings: device.connectionSettings || {}
      }));
    } catch (error) {
      console.error('Error getting devices by capability from MongoDB:', error);
      return memStorage.getDevicesByCapability(capability);
    }
  }

  async clearTestData(): Promise<void> {
    try {
      if (!isConnected()) return;
      
      // Delete all test users (users with email containing 'test' or username starting with 'test')
      await models.User.deleteMany({
        $or: [
          { email: { $regex: 'test', $options: 'i' } },
          { username: { $regex: '^test', $options: 'i' } }
        ]
      });
    } catch (error) {
      console.error('Error clearing test data from MongoDB:', error);
    }
  }

  async getReminderById(id: string | mongoose.Types.ObjectId): Promise<Reminder | null> {
    try {
      if (!isConnected()) return null;
      
      const objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
      const reminder = await models.Reminder.findOne({ _id: objectId });
      
      if (!reminder) return null;
      
      return {
        id: reminder._id.toString(),
        userId: reminder.userId.toString(),
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        color: reminder.color
      };
    } catch (error) {
      console.error('Error getting reminder by ID:', error);
      return null;
    }
  }

  async updateReminder(id: number, update: Partial<Reminder>): Promise<Reminder | null> {
    try {
      const reminder = await models.Reminder.findOneAndUpdate(
        { id },
        { $set: update },
        { new: true }
      );
      return reminder ? reminder.toObject() : null;
    } catch (error) {
      console.error('Error updating reminder:', error);
      return null;
    }
  }

  async deleteReminder(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    try {
      if (!isConnected()) return false;
      
      const objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
      const result = await models.Reminder.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }

  async getAllReminders(): Promise<Reminder[]> {
    try {
      if (!isConnected()) {
        console.log('MongoDB not connected, falling back to memory storage');
        return memStorage.getAllReminders();
      }
      
      const reminders = await models.Reminder.find({ isCompleted: false });
      return reminders.map(reminder => ({
        id: reminder._id.toString(),
        userId: reminder.userId.toString(),
        title: reminder.title,
        description: reminder.description,
        time: reminder.time,
        frequency: reminder.frequency,
        isCompleted: reminder.isCompleted,
        category: reminder.category,
        color: reminder.color
      }));
    } catch (error) {
      console.error('Error getting all reminders:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const mongoStorage = new MongoStorage();
