import mongoose, { Document, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
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
}

// WearableDevice Interface
export interface IWearableDevice extends Document {
  userId: mongoose.Types.ObjectId | string;
  deviceName: string;
  deviceType: string;
  isConnected: boolean;
  lastSynced: Date;
}

// WellnessPlan Interface
export interface IWellnessPlan extends Document {
  userId: mongoose.Types.ObjectId | string;
  planName: string;
  planType: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goals: object;
}

// Doctor Interface
export interface IDoctor extends Document {
  firstName: string;
  lastName: string;
  specialty: string;
  practice: string; // Changed from hospital to practice
  location: string;
  rating: number;
  reviewCount: number; // Added reviewCount
  profileImage: string;
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
  createdAt: { type: Date, default: Date.now }
});

const HealthDataSchema = new Schema<IHealthData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

const WearableDeviceSchema = new Schema<IWearableDevice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String, required: true },
  isConnected: { type: Boolean, default: false },
  lastSynced: { type: Date, default: null }
});

const WellnessPlanSchema = new Schema<IWellnessPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  planType: { type: String, required: true },
  description: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  goals: { type: Schema.Types.Mixed, required: true }
});

const DoctorSchema = new Schema<IDoctor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: true },
  practice: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, default: null },
  profileImage: { type: String, required: true }
});

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: { type: String, required: true },
  time: { type: String, default: null },
  frequency: { type: String, default: null },
  isCompleted: { type: Boolean, default: false },
  color: { type: String, default: null }
});

const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  unit: { type: String, default: null }
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
  createdAt: { type: Date, default: Date.now }
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
