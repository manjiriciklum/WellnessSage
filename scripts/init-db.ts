import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017/wellnesssage';

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  profileImage: String,
  createdAt: Date
});

const doctorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  specialty: String,
  practice: String,
  location: String,
  rating: Number,
  reviewCount: Number,
  profileImage: String
});

// Create models
const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample data
    const sampleUsers = [
      {
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        createdAt: new Date()
      }
    ];

    const sampleDoctors = [
      {
        firstName: 'John123',
        lastName: 'Doe',
        specialty: 'General Medicine',
        practice: 'City Hospital',
        location: 'New York',
        rating: 4.5,
        reviewCount: 100,
        profileImage: null
      }
    ];

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert sample data
    await Promise.all([
      User.insertMany(sampleUsers),
      Doctor.insertMany(sampleDoctors)
    ]);
    console.log('Inserted sample data');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeDatabase(); 