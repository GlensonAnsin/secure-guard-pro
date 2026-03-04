import winston from 'winston';
import path from 'path';
import env from '../config/env.js';

class Logger {
  private logger: winston.Logger;

  constructor() {
    // Define the custom format (Timestamp + Level + Message)
    const logFormat = winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    });

    this.logger = winston.createLogger({
      level: env.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        logFormat
      ),
      transports: [
        // 1. Write all logs with level 'error' and below to error.log
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', 'error.log'), 
          level: 'error' 
        }),
        // 2. Write all logs to combined.log
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', 'combined.log') 
        }),
      ],
    });

    // If we're not in production, log to the console with colors
    if (env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  /**
   * Log an info message.
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log an error message.
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log a warning message.
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log a debug message.
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

export default new Logger();