# WellnessSage - Health and Wellness Management Platform

WellnessSage is a comprehensive health and wellness management platform that helps users track their health metrics, connect with healthcare providers, and receive AI-powered health insights.

## Features

- Health metrics tracking (steps, sleep, heart rate, etc.)
- Wearable device integration
- AI-powered health insights
- Doctor consultation scheduling
- Wellness plan management
- Real-time health monitoring
- Secure data storage with HIPAA compliance

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query
- Vite

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- WebSocket for real-time updates
- OpenAI integration for health insights

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/WellnessSage.git
   cd WellnessSage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/wellnesssage
   JWT_SECRET=your_jwt_secret_here
   SESSION_SECRET=your_session_secret_here
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - For local installation:
     ```bash
     # On Windows
     # 1. Download MongoDB Community Server from:
     # https://www.mongodb.com/try/download/community
     
     # 2. Run the installer and follow the installation wizard
     # - Choose "Complete" installation
     # - Install MongoDB as a Service should be checked by default
     # - The service will start automatically after installation
     
     # 3. Verify MongoDB is running:
     # Open Task Manager -> Services tab
     # Look for "MongoDB" service - it should be running
     
     # If you need to start/stop MongoDB manually:
     # Open Command Prompt as Administrator and run:
     net start MongoDB    # To start MongoDB
     net stop MongoDB     # To stop MongoDB
     
     # On macOS with Homebrew
     brew tap mongodb/brew
     brew install mongodb-community
     
     # On Ubuntu
     sudo apt update
     sudo apt install mongodb
     ```
   - Start MongoDB service:
     ```bash
     # On Windows
     # MongoDB should be running automatically after installation
     # If not, open Command Prompt as Administrator and run:
     net start MongoDB
     
     # On macOS
     brew services start mongodb-community
     
     # On Ubuntu
     sudo systemctl start mongodb
     ```

5. **Optional: Initialize test data**
   If you want to populate the database with sample test data (recommended for development):
   ```bash
   npm run db:init
   ```
   This will create:
   - A test user account
   - A sample doctor profile
   - Clear any existing data in these collections

   Note: This step is optional. The application will work without it, creating collections automatically as needed.

## Development

1. **Start the development server**
   ```bash
   # Start backend server
   npm run dev
   
   # In a new terminal, start frontend development server
   npm run dev:frontend
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

```
WellnessSage/
├── client/             # Frontend React application
├── server/             # Backend Express application
├── shared/             # Shared types and utilities
├── scripts/            # Database initialization and utility scripts
└── dist/              # Production build output
```

## API Documentation

The API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- OpenAI for AI integration
- MongoDB for database
- All contributors and users of WellnessSage 