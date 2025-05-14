import mongoose, { Document, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  role?: string;
  oauthProvider?: string;
  oauthId?: string;
  lastLogin?: Date;
  createdAt: Date;
}

// HealthData Interface
export interface IHealthData extends Document {
  userId: mongoose.Types.ObjectId | string;
  date: Date;
  steps: number;
  activeMinutes: number;
  calories: number;
  sleepHours: number;
  sleepQuality: number;
  heartRate: number;
  healthScore: number;
  stressLevel: number;
  healthMetrics?: Record<string, any>;
}

// WearableDevice Interface
export interface IWearableDevice extends Document {
  userId: mongoose.Types.ObjectId | string;
  deviceName: string;
  deviceType: string;
  deviceModel?: string;
  manufacturer?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  isConnected: boolean;
  lastSynced: Date;
  batteryLevel?: number;
  capabilities?: string[];
  connectionSettings?: Record<string, any>;
}

// WellnessPlan Interface
export interface IWellnessPlan extends Document {
  userId: mongoose.Types.ObjectId | string;
  planName: string;
  planType: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goals: Record<string, any>;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Doctor Interface
export interface IDoctor extends Document {
  firstName: string;
  lastName: string;
  specialty: string;
  practice: string;
  location: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  createdAt: Date;
}

// Reminder Interface
export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  category: string;
  time: string;
  frequency: string;
  isCompleted: boolean;
  color: string;
  createdAt: Date;
}

// Goal Interface
export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  category: string;
  target: number;
  current: number;
  startDate: Date;
  endDate: Date;
  unit: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

// AIInsight Interface
export interface IAIInsight extends Document {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  category: string;
  action: string;
  createdAt: Date;
  isRead: boolean;
}

// HealthConsultation Interface
export interface IHealthConsultation extends Document {
  userId: mongoose.Types.ObjectId | string;
  symptoms: string;
  analysis: string;
  recommendations: string;
  severity: string;
  createdAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// ChatMessage Interface for storing chat history
export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId | string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Define schemas
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'user' },
  oauthProvider: { type: String, default: null },
  oauthId: { type: String, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const HealthDataSchema = new Schema<IHealthData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  steps: { type: Number, default: 0 },
  activeMinutes: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  sleepQuality: { type: Number, default: 0 },
  heartRate: { type: Number, default: 0 },
  healthScore: { type: Number, default: 0 },
  stressLevel: { type: Number, default: 0 },
  healthMetrics: { type: Schema.Types.Mixed, default: {} }
});

const WearableDeviceSchema = new Schema<IWearableDevice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String, required: true },
  deviceModel: { type: String, default: null },
  manufacturer: { type: String, default: null },
  serialNumber: { type: String, default: null },
  firmwareVersion: { type: String, default: null },
  isConnected: { type: Boolean, default: false },
  lastSynced: { type: Date, default: null },
  batteryLevel: { type: Number, default: null },
  capabilities: { type: [String], default: [] },
  connectionSettings: { type: Schema.Types.Mixed, default: {} }
});

const WellnessPlanSchema = new Schema<IWellnessPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  planType: { type: String, required: true },
  description: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  goals: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const DoctorSchema = new Schema<IDoctor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: true },
  practice: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, default: 0 },
  profileImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: { type: String, required: true },
  time: { type: String, default: null },
  frequency: { type: String, default: null },
  isCompleted: { type: Boolean, default: false },
  color: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  unit: { type: String, default: null },
  status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },
  createdAt: { type: Date, default: Date.now }
});

const AIInsightSchema = new Schema<IAIInsight>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  action: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const HealthConsultationSchema = new Schema<IHealthConsultation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, required: true },
  analysis: { type: String, required: true },
  recommendations: { type: String, required: true },
  severity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
});

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create and export models
const models = {
  User: mongoose.models.User || mongoose.model<IUser>('User', UserSchema),
  HealthData: mongoose.models.HealthData || mongoose.model<IHealthData>('HealthData', HealthDataSchema),
  WearableDevice: mongoose.models.WearableDevice || mongoose.model<IWearableDevice>('WearableDevice', WearableDeviceSchema),
  WellnessPlan: mongoose.models.WellnessPlan || mongoose.model<IWellnessPlan>('WellnessPlan', WellnessPlanSchema),
  Doctor: mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema),
  Reminder: mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema),
  Goal: mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema),
  AIInsight: mongoose.models.AIInsight || mongoose.model<IAIInsight>('AIInsight', AIInsightSchema),
  HealthConsultation: mongoose.models.HealthConsultation || mongoose.model<IHealthConsultation>('HealthConsultation', HealthConsultationSchema),
  ChatMessage: mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)
};

export default models;
