import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import ApiResponse from '../utils/ApiResponse.js';
import env from '../config/env.js';

class Maintenance {
  private lockFile = path.join(process.cwd(), 'maintenance.lock');

  public handle = (req: Request, res: Response, next: NextFunction) => {
    if (fs.existsSync(this.lockFile)) {
      const bypassSecret = req.headers['x-bypass-maintenance'];

      if (bypassSecret === env.MAINTENANCE_SECRET) {
        return next();
      }

      res.status(503);
      res.setHeader('Retry-After', '60');

      if (req.accepts('html')) {
        const viewPath = path.join(process.cwd(), 'views', 'maintenance.html');
        if (fs.existsSync(viewPath)) {
          return res.sendFile(viewPath);
        }
      }

      return ApiResponse.error(res, 'System is currently under maintenance. Please try again later.', 503);
    }
    
    next();
  };
}

export default new Maintenance();