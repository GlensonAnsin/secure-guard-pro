import { Router } from 'express';
import GuardsController from '../controllers/GuardsController.js';
import FirearmController from '../controllers/FirearmController.js';
import FirearmIssuanceController from '../controllers/FirearmIssuanceController.js';
import DesignationController from '../controllers/DesignationController.js';
import AttendanceController from '../controllers/AttendanceController.js';
import DashboardController from '../controllers/DashboardController.js';
import MobileController from '../controllers/MobileController.js';
import Authentication from '../middlewares/Authentication.js';
import Validator from '../middlewares/Validator.js';
import GuardViewController from '../controllers/GuardViewController.js';
import UserRequest from '../requests/UserRequest.js';
import AuthController from '../controllers/AuthController.js';
import RequireAdmin from '../middlewares/RequireAdmin.js';
// import Limiter from '../middlewares/Limiter.js';

class ApiRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Define all API routes here.
   */
  protected initializeRoutes(): void {
    // Auth
    this.router.post('/login', AuthController.login);
    this.router.post('/refresh', AuthController.refresh);
    this.router.post('/logout', Authentication.handle, AuthController.logout);

    // Protected
    this.router.get('/me', Authentication.handle, AuthController.me);
    this.router.put('/auth/change-password', Authentication.handle, AuthController.changePassword);

    // Mobile (Guard App)
    this.router.post('/mobile/login', AuthController.guardLogin);
    this.router.get('/mobile/me', Authentication.handle, MobileController.me);
    this.router.get('/mobile/attendances', Authentication.handle, MobileController.getAttendances);
    this.router.post('/mobile/time-in', Authentication.handle, MobileController.timeIn);
    this.router.post('/mobile/time-out', Authentication.handle, MobileController.timeOut);

    // Dashboard
    this.router.get('/dashboard-data', Authentication.handle, DashboardController.getDashboardData);
    this.router.get('/dashboard-activities', Authentication.handle, DashboardController.getActivities);

    // Guards
    this.router.get('/guard-stats', Authentication.handle, GuardsController.getGuardStats);
    this.router.get('/guards', Authentication.handle, GuardsController.index);
    this.router.get('/guards/:id', Authentication.handle, GuardViewController.show);
    this.router.put('/guards/:id/status', Authentication.handle, GuardViewController.updateStatus);
    this.router.post('/guards', Authentication.handle, Validator.validate(UserRequest.store), GuardsController.store);
    this.router.put('/guards/:id', Authentication.handle, GuardsController.update);
    this.router.delete('/guards/:id', Authentication.handle, GuardsController.destroy);

    // Firearms
    this.router.get('/firearm-stats', Authentication.handle, RequireAdmin.handle, FirearmController.getFirearmStats);
    this.router.get('/firearms', Authentication.handle, RequireAdmin.handle, FirearmController.index);
    this.router.get('/firearms/:id', Authentication.handle, RequireAdmin.handle, FirearmController.show);
    this.router.post('/firearms', Authentication.handle, RequireAdmin.handle, FirearmController.store);
    this.router.put('/firearms/:id', Authentication.handle, RequireAdmin.handle, FirearmController.update);
    this.router.delete('/firearms/:id', Authentication.handle, RequireAdmin.handle, FirearmController.destroy);

    // Firearm Issuances
    this.router.get('/firearm-issuances', Authentication.handle, RequireAdmin.handle, FirearmIssuanceController.index);
    this.router.get('/firearm-issuances/:id', Authentication.handle, RequireAdmin.handle, FirearmIssuanceController.show);
    this.router.post('/firearm-issuances', Authentication.handle, RequireAdmin.handle, FirearmIssuanceController.store);
    this.router.put('/firearm-issuances/:id', Authentication.handle, RequireAdmin.handle, FirearmIssuanceController.update);
    this.router.delete('/firearm-issuances/:id', Authentication.handle, RequireAdmin.handle, FirearmIssuanceController.destroy);

    // Designations
    this.router.get('/designations', Authentication.handle, DesignationController.index);
    this.router.get('/designations/:id', Authentication.handle, DesignationController.show);
    this.router.post('/designations', Authentication.handle, DesignationController.store);
    this.router.put('/designations/:id', Authentication.handle, DesignationController.update);
    this.router.delete('/designations/:id', Authentication.handle, DesignationController.destroy);

    // Attendances
    this.router.get('/attendance-stats', Authentication.handle, AttendanceController.getAttendanceStats);
    this.router.get('/attendance-export', Authentication.handle, AttendanceController.export);
    this.router.get('/attendances', Authentication.handle, AttendanceController.index);
    this.router.get('/attendances/:id', Authentication.handle, AttendanceController.show);
    this.router.post('/attendances', Authentication.handle, AttendanceController.store);
    this.router.put('/attendances/:id', Authentication.handle, AttendanceController.update);
    this.router.delete('/attendances/:id', Authentication.handle, AttendanceController.destroy);
  }
}

export default new ApiRoutes().router;