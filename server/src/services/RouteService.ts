import { Application } from 'express';
import apiRoutes from '../routes/api.js';
import webRoutes from '../routes/web.js';

class RouteService {
  /**
   * Register all routes for the application.
   */
  public boot(app: Application): void {
    app.use('/api', apiRoutes);
    app.use('/', webRoutes);
  }
}

export default new RouteService();