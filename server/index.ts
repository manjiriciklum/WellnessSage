import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { auditLogMiddleware, requireTLS, sessionTimeout } from "./security";
import { connectToDatabase } from "./db/mongodb";
// Import MongoDB storage but don't set as default yet
import { mongoStorage } from "./db/mongo-storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HIPAA-compliant security middleware
app.use(requireTLS); // Ensure TLS/SSL in production
app.use(auditLogMiddleware); // Log all API access for HIPAA compliance

// Only enable session timeout in production
if (process.env.NODE_ENV === 'production') {
  app.use(sessionTimeout(15)); // 15-minute session timeout (HIPAA requirement)
  console.log('Session timeout middleware enabled for production');
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Try to connect to MongoDB but don't wait for it to complete before starting the server
  // This way the server can start up quickly and fall back to in-memory storage if needed
  connectToDatabase()
    .then(() => log('MongoDB connection initialized'))
    .catch(error => {
      log('Failed to connect to MongoDB, using in-memory storage as fallback');
      console.error('MongoDB connection error:', error);
    });

  // Continue with server startup regardless of MongoDB connection status
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
