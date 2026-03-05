import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import FirearmController from '../controllers/FirearmController.js';
import FirearmIssuanceController from '../controllers/FirearmIssuanceController.js';
import DesignationController from '../controllers/DesignationController.js';
import AttendanceController from '../controllers/AttendanceController.js';
import Authentication from '../middlewares/Authentication.js';
import Validator from '../middlewares/Validator.js';
import UserRequest from '../requests/UserRequest.js';
import AuthController from '../controllers/AuthController.js';
import Limiter from '../middlewares/Limiter.js';

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

    // Stats
    this.router.get('/guard-stats', Authentication.handle, UserController.getGuardStats);

    // Users
    this.router.get('/users', Authentication.handle, UserController.index);
    this.router.get('/users/:id', Authentication.handle, UserController.show);
    this.router.post('/users', Authentication.handle, Validator.validate(UserRequest.store), UserController.store);
    this.router.put('/users/:id', Authentication.handle, UserController.update);
    this.router.delete('/users/:id', Authentication.handle, UserController.destroy);

    // Firearms
    this.router.get('/firearms', Authentication.handle, FirearmController.index);
    this.router.get('/firearms/:id', Authentication.handle, FirearmController.show);
    this.router.post('/firearms', Authentication.handle, FirearmController.store);
    this.router.put('/firearms/:id', Authentication.handle, FirearmController.update);
    this.router.delete('/firearms/:id', Authentication.handle, FirearmController.destroy);

    // Firearm Issuances
    this.router.get('/firearm-issuances', Authentication.handle, FirearmIssuanceController.index);
    this.router.get('/firearm-issuances/:id', Authentication.handle, FirearmIssuanceController.show);
    this.router.post('/firearm-issuances', Authentication.handle, FirearmIssuanceController.store);
    this.router.put('/firearm-issuances/:id', Authentication.handle, FirearmIssuanceController.update);
    this.router.delete('/firearm-issuances/:id', Authentication.handle, FirearmIssuanceController.destroy);

    // Designations
    this.router.get('/designations', Authentication.handle, DesignationController.index);
    this.router.get('/designations/:id', Authentication.handle, DesignationController.show);
    this.router.post('/designations', Authentication.handle, DesignationController.store);
    this.router.put('/designations/:id', Authentication.handle, DesignationController.update);
    this.router.delete('/designations/:id', Authentication.handle, DesignationController.destroy);

    // Attendances
    this.router.get('/attendances', Authentication.handle, AttendanceController.index);
    this.router.get('/attendances/:id', Authentication.handle, AttendanceController.show);
    this.router.post('/attendances', Authentication.handle, AttendanceController.store);
    this.router.put('/attendances/:id', Authentication.handle, AttendanceController.update);
    this.router.delete('/attendances/:id', Authentication.handle, AttendanceController.destroy);
  }
}

export default new ApiRoutes().router;