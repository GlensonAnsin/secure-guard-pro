import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/Logger.js';

/**
 * HTTP Request Logger Middleware
 * 
 * Logs each incoming request with method, path, status code, and response time.
 */
class RequestLogger {
  public handle(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Listen for the response finish event
    res.on('finish', () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

      if (res.statusCode >= 500) {
        Logger.error(message);
      } else if (res.statusCode >= 400) {
        Logger.warn(message);
      } else {
        Logger.info(message);
      }
    });

    next();
  }
}

export default new RequestLogger();
