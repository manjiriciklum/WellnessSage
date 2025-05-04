import { 
  users, type User, type InsertUser,
  healthData, type HealthData, type InsertHealthData,
  wearableDevices, type WearableDevice, type InsertWearableDevice,
  wellnessPlans, type WellnessPlan, type InsertWellnessPlan,
  doctors, type Doctor, type InsertDoctor,
  reminders, type Reminder, type InsertReminder,
  goals, type Goal, type InsertGoal,
  aiInsights, type AiInsight, type InsertAiInsight
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Health Data methods
  getHealthDataByUserId(userId: number): Promise<HealthData[]>;
  getLatestHealthData(userId: number): Promise<HealthData | undefined>;
  createHealthData(data: InsertHealthData): Promise<HealthData>;

  // Wearable Device methods
  getWearableDevicesByUserId(userId: number): Promise<WearableDevice[]>;
  getWearableDevice(id: number): Promise<WearableDevice | undefined>;
  createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice>;
  connectWearableDevice(id: number): Promise<WearableDevice | undefined>;
  disconnectWearableDevice(id: number): Promise<WearableDevice | undefined>;

  // Wellness Plan methods
  getWellnessPlansByUserId(userId: number): Promise<WellnessPlan[]>;
  getWellnessPlan(id: number): Promise<WellnessPlan | undefined>;
  createWellnessPlan(plan: InsertWellnessPlan): Promise<WellnessPlan>;

  // Doctor methods
  getAllDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsBySpecialty(specialty: string): Promise<Doctor[]>;
  getDoctorsByLocation(location: string): Promise<Doctor[]>;
  getDoctorsBySpecialtyAndLocation(specialty: string, location: string): Promise<Doctor[]>;

  // Reminder methods
  getRemindersByUserId(userId: number): Promise<Reminder[]>;
  getReminder(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  completeReminder(id: number): Promise<Reminder | undefined>;

  // Goal methods
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(id: number, current: number): Promise<Goal | undefined>;

  // AI Insight methods
  getAiInsightsByUserId(userId: number): Promise<AiInsight[]>;
  getAiInsight(id: number): Promise<AiInsight | undefined>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markAiInsightAsRead(id: number): Promise<AiInsight | undefined>;

  // Demo data generation
  generateDemoData(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthData: Map<number, HealthData>;
  private wearableDevices: Map<number, WearableDevice>;
  private wellnessPlans: Map<number, WellnessPlan>;
  private doctors: Map<number, Doctor>;
  private reminders: Map<number, Reminder>;
  private goals: Map<number, Goal>;
  private aiInsights: Map<number, AiInsight>;
  
  private userId: number;
  private healthDataId: number;
  private wearableDeviceId: number;
  private wellnessPlanId: number;
  private doctorId: number;
  private reminderId: number;
  private goalId: number;
  private aiInsightId: number;

  constructor() {
    this.users = new Map();
    this.healthData = new Map();
    this.wearableDevices = new Map();
    this.wellnessPlans = new Map();
    this.doctors = new Map();
    this.reminders = new Map();
    this.goals = new Map();
    this.aiInsights = new Map();
    
    this.userId = 1;
    this.healthDataId = 1;
    this.wearableDeviceId = 1;
    this.wellnessPlanId = 1;
    this.doctorId = 1;
    this.reminderId = 1;
    this.goalId = 1;
    this.aiInsightId = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Health Data methods
  async getHealthDataByUserId(userId: number): Promise<HealthData[]> {
    return Array.from(this.healthData.values()).filter(
      (data) => data.userId === userId
    );
  }

  async getLatestHealthData(userId: number): Promise<HealthData | undefined> {
    const userHealthData = await this.getHealthDataByUserId(userId);
    if (userHealthData.length === 0) return undefined;
    
    return userHealthData.reduce((latest, current) => {
      if (!latest.date || (current.date && current.date > latest.date)) {
        return current;
      }
      return latest;
    });
  }

  async createHealthData(insertData: InsertHealthData): Promise<HealthData> {
    const id = this.healthDataId++;
    const data: HealthData = { ...insertData, id };
    this.healthData.set(id, data);
    return data;
  }

  // Wearable Device methods
  async getWearableDevicesByUserId(userId: number): Promise<WearableDevice[]> {
    return Array.from(this.wearableDevices.values()).filter(
      (device) => device.userId === userId
    );
  }

  async getWearableDevice(id: number): Promise<WearableDevice | undefined> {
    return this.wearableDevices.get(id);
  }

  async createWearableDevice(insertDevice: InsertWearableDevice): Promise<WearableDevice> {
    const id = this.wearableDeviceId++;
    const device: WearableDevice = { ...insertDevice, id };
    this.wearableDevices.set(id, device);
    return device;
  }

  async connectWearableDevice(id: number): Promise<WearableDevice | undefined> {
    const device = this.wearableDevices.get(id);
    if (!device) return undefined;
    
    const updatedDevice: WearableDevice = {
      ...device,
      isConnected: true,
      lastSynced: new Date()
    };
    this.wearableDevices.set(id, updatedDevice);
    return updatedDevice;
  }

  async disconnectWearableDevice(id: number): Promise<WearableDevice | undefined> {
    const device = this.wearableDevices.get(id);
    if (!device) return undefined;
    
    const updatedDevice: WearableDevice = {
      ...device,
      isConnected: false
    };
    this.wearableDevices.set(id, updatedDevice);
    return updatedDevice;
  }

  // Wellness Plan methods
  async getWellnessPlansByUserId(userId: number): Promise<WellnessPlan[]> {
    return Array.from(this.wellnessPlans.values()).filter(
      (plan) => plan.userId === userId
    );
  }

  async getWellnessPlan(id: number): Promise<WellnessPlan | undefined> {
    return this.wellnessPlans.get(id);
  }

  async createWellnessPlan(insertPlan: InsertWellnessPlan): Promise<WellnessPlan> {
    const id = this.wellnessPlanId++;
    const plan: WellnessPlan = { ...insertPlan, id };
    this.wellnessPlans.set(id, plan);
    return plan;
  }

  // Doctor methods
  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(
      (doctor) => doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  async getDoctorsByLocation(location: string): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(
      (doctor) => doctor.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  async getDoctorsBySpecialtyAndLocation(specialty: string, location: string): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(
      (doctor) => 
        doctor.specialty.toLowerCase().includes(specialty.toLowerCase()) &&
        doctor.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Reminder methods
  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId
    );
  }

  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderId++;
    const reminder: Reminder = { ...insertReminder, id };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async completeReminder(id: number): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder: Reminder = {
      ...reminder,
      isCompleted: true
    };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  // Goal methods
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalId++;
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoalProgress(id: number, current: number): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal: Goal = {
      ...goal,
      current
    };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  // AI Insight methods
  async getAiInsightsByUserId(userId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.userId === userId
    );
  }

  async getAiInsight(id: number): Promise<AiInsight | undefined> {
    return this.aiInsights.get(id);
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.aiInsightId++;
    const insight: AiInsight = { 
      ...insertInsight, 
      id,
      createdAt: new Date()
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async markAiInsightAsRead(id: number): Promise<AiInsight | undefined> {
    const insight = this.aiInsights.get(id);
    if (!insight) return undefined;
    
    const updatedInsight: AiInsight = {
      ...insight,
      isRead: true
    };
    this.aiInsights.set(id, updatedInsight);
    return updatedInsight;
  }

  // Initialize demo data
  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: 1,
      username: 'emmauser',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma@example.com',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    this.userId++;

    // Create demo doctors
    const demoDoctors: Doctor[] = [
      {
        id: 1,
        firstName: 'Sarah',
        lastName: 'Johnson',
        specialty: 'Cardiology',
        practice: 'SF Medical Center',
        location: 'San Francisco, CA',
        rating: 4.7,
        reviewCount: 128,
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 2,
        firstName: 'Michael',
        lastName: 'Chen',
        specialty: 'Primary Care',
        practice: 'Bay Health Clinic',
        location: 'San Francisco, CA',
        rating: 4.2,
        reviewCount: 95,
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 3,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        specialty: 'Mental Health',
        practice: 'Wellbeing Center',
        location: 'San Francisco, CA',
        rating: 4.9,
        reviewCount: 210,
        profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80'
      }
    ];
    
    demoDoctors.forEach(doctor => {
      this.doctors.set(doctor.id, doctor);
      this.doctorId++;
    });

    // Create demo wearable devices
    const demoDevices: WearableDevice[] = [
      {
        id: 1,
        userId: 1,
        deviceName: 'Fitbit Sense',
        deviceType: 'watch',
        isConnected: true,
        lastSynced: new Date()
      },
      {
        id: 2,
        userId: 1,
        deviceName: 'Apple Health',
        deviceType: 'smartphone',
        isConnected: true,
        lastSynced: new Date()
      },
      {
        id: 3,
        userId: 1,
        deviceName: 'Smart Scale',
        deviceType: 'scale',
        isConnected: false,
        lastSynced: undefined
      }
    ];
    
    demoDevices.forEach(device => {
      this.wearableDevices.set(device.id, device);
      this.wearableDeviceId++;
    });

    // Create demo reminders
    const demoReminders: Reminder[] = [
      {
        id: 1,
        userId: 1,
        title: 'Take Medication',
        description: '',
        time: '8:00 AM & 8:00 PM',
        frequency: 'daily',
        isCompleted: false,
        category: 'medication',
        color: '#f44336'
      },
      {
        id: 2,
        userId: 1,
        title: 'Drink Water',
        description: '',
        time: 'Every 2 hours',
        frequency: 'hourly',
        isCompleted: false,
        category: 'hydration',
        color: '#1e88e5'
      },
      {
        id: 3,
        userId: 1,
        title: 'Meditation Session',
        description: '',
        time: '6:30 PM',
        frequency: 'daily',
        isCompleted: false,
        category: 'wellness',
        color: '#26a69a'
      }
    ];
    
    demoReminders.forEach(reminder => {
      this.reminders.set(reminder.id, reminder);
      this.reminderId++;
    });

    // Create demo goals
    const demoGoals: Goal[] = [
      {
        id: 1,
        userId: 1,
        title: 'Exercise 5 days',
        target: 5,
        current: 3,
        unit: 'days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        category: 'exercise'
      },
      {
        id: 2,
        userId: 1,
        title: 'Sleep 8+ hours',
        target: 7,
        current: 2,
        unit: 'days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        category: 'sleep'
      },
      {
        id: 3,
        userId: 1,
        title: 'Meditation',
        target: 7,
        current: 4,
        unit: 'days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        category: 'meditation'
      }
    ];
    
    demoGoals.forEach(goal => {
      this.goals.set(goal.id, goal);
      this.goalId++;
    });

    // Create demo AI insights
    const demoInsights: AiInsight[] = [
      {
        id: 1,
        userId: 1,
        title: 'Stress Management Recommendation',
        description: 'Your heart rate variability has decreased this week, which may indicate increased stress levels. Consider adding 10-minute meditation sessions in the morning.',
        category: 'stress',
        action: 'View Plan',
        createdAt: new Date(),
        isRead: false
      },
      {
        id: 2,
        userId: 1,
        title: 'Nutrition Improvement',
        description: 'Based on your food logging patterns, we notice you may benefit from increasing protein intake in the morning. This could help sustain energy levels throughout the day.',
        category: 'nutrition',
        action: 'See Suggestions',
        createdAt: new Date(),
        isRead: false
      },
      {
        id: 3,
        userId: 1,
        title: 'Fitness Progress Alert',
        description: 'Great job on your consistency! You\'ve met your step goal 5 days in a row. Consider increasing your daily step target by 10% to continue improving cardiovascular health.',
        category: 'fitness',
        action: 'Adjust Goals',
        createdAt: new Date(),
        isRead: false
      }
    ];
    
    demoInsights.forEach(insight => {
      this.aiInsights.set(insight.id, insight);
      this.aiInsightId++;
    });

    // Create demo health data
    const today = new Date();
    const demoHealthData: HealthData = {
      id: 1,
      userId: 1,
      date: today,
      steps: 8456,
      activeMinutes: 42,
      calories: 1450,
      sleepHours: 7.33, // 7h 20m
      sleepQuality: 72,
      heartRate: 68,
      healthScore: 85,
      stressLevel: 35
    };
    
    this.healthData.set(demoHealthData.id, demoHealthData);
    this.healthDataId++;

    // Create some historical health data for the past week
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      
      const pastHealthData: HealthData = {
        id: this.healthDataId++,
        userId: 1,
        date: pastDate,
        steps: 7000 + Math.floor(Math.random() * 4000),
        activeMinutes: 30 + Math.floor(Math.random() * 40),
        calories: 1200 + Math.floor(Math.random() * 800),
        sleepHours: 6 + Math.random() * 3,
        sleepQuality: 60 + Math.floor(Math.random() * 30),
        heartRate: 65 + Math.floor(Math.random() * 15),
        healthScore: 75 + Math.floor(Math.random() * 15),
        stressLevel: 30 + Math.floor(Math.random() * 30)
      };
      
      this.healthData.set(pastHealthData.id, pastHealthData);
    }
  }

  // Generate demo data for a user
  async generateDemoData(userId: number): Promise<void> {
    // This method would generate realistic health data, insights, etc.
    // for demo purposes. For now, we're just using the pre-initialized data.
    return Promise.resolve();
  }
}

export const storage = new MemStorage();
