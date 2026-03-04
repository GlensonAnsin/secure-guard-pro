import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import ApiResponse from '../utils/ApiResponse.js';
import Logger from '../utils/Logger.js';

class ExceptionHandler {
  /**
   * Handle 404 Not Found errors.
   * Serves HTML for browser requests, JSON for API requests.
   */
  notFound(req: Request, res: Response, next: NextFunction) {
    if (req.accepts('html') && !req.originalUrl.startsWith('/api')) {
      const viewPath = path.join(process.cwd(), 'views', '404.html');
      if (fs.existsSync(viewPath)) {
        return res.status(404).sendFile(viewPath);
      }
    }

    return ApiResponse.error(res, 'Route not found', 404);
  }

  /**
   * Handle global application errors.
   * Matches Express (err, req, res, next) signature.
   */
  handle(err: any, req: Request, res: Response, next: NextFunction) {
    // Log the error
    Logger.error('Exception:', err.stack || err.message);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errorDetails = process.env.NODE_ENV === 'development' ? err : {};

    return ApiResponse.error(res, message, status, errorDetails);
  }
}

export default new ExceptionHandler();