import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import db from './src/models/index.js';
import RouteService from './src/services/RouteService.js';
import ExceptionHandler from './src/exceptions/Handler.js';
import Logger from './src/utils/Logger.js';
import Limiter from './src/middlewares/Limiter.js';
import Maintenance from './src/middlewares/Maintenance.js';
import RequestLogger from './src/middlewares/RequestLogger.js';
import env from './src/config/env.js';

const app: Application = express();
const PORT = env.APP_PORT;

// ==========================
// Global Middleware
// ==========================
app.use(Maintenance.handle);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(Limiter.global);
app.use(RequestLogger.handle);

// ==========================
// Register Routes
// ==========================
// This loads both your API and Web routes
RouteService.boot(app);

// ==========================
// Error Handling
// ==========================

// 404 Not Found Handler
app.use(ExceptionHandler.notFound);

// Global Error Handler
app.use(ExceptionHandler.handle);

// ==========================
// Start Server
// ==========================
let server: ReturnType<typeof app.listen>;

const start = async () => {
  try {
    // Test Database Connection
    await db.connect();

    // Start Listening
    server = app.listen(PORT, () => {
      Logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// ==========================
// Graceful Shutdown
// ==========================
const shutdown = async (signal: string) => {
  Logger.info(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      Logger.info('HTTP server closed.');

      try {
        await db.sequelize.close();
        Logger.info('Database connection closed.');
      } catch (error) {
        Logger.error('Error closing database connection:', error);
      }

      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      Logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();