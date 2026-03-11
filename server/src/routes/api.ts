import { Router } from 'express';
import GuardsController from '../controllers/GuardsController.js';
import FirearmController from '../controllers/FirearmController.js';
import FirearmIssuanceController from '../controllers/FirearmIssuanceController.js';
import DesignationController from '../controllers/DesignationController.js';
import AttendanceController from '../controllers/AttendanceController.js';
import DashboardController from '../controllers/DashboardController.js';
import MobileController from '../controllers/MobileController.js';
import CompanyController from '../controllers/CompanyController.js';
import ArchiveController from '../controllers/ArchiveController.js';
import ReportController from '../controllers/ReportController.js';
import ShiftRotationController from '../controllers/ShiftRotationController.js';
import UserManagementController from '../controllers/UserManagementController.js';
import Authentication from '../middlewares/Authentication.js';
import Validator from '../middlewares/Validator.js';
import GuardViewController from '../controllers/GuardViewController.js';
import UserRequest from '../requests/UserRequest.js';
import AuthController from '../controllers/AuthController.js';
import RequireAdmin from '../middlewares/RequireAdmin.js';
import RequireAdminOrHR from '../middlewares/RequireAdminOrHR.js';

class ApiRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

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
    this.router.get('/firearm-stats', Authentication.handle, RequireAdminOrHR.handle, FirearmController.getFirearmStats);
    this.router.get('/firearms', Authentication.handle, RequireAdminOrHR.handle, FirearmController.index);
    this.router.get('/firearms/:id', Authentication.handle, RequireAdminOrHR.handle, FirearmController.show);
    this.router.post('/firearms', Authentication.handle, RequireAdmin.handle, FirearmController.store);
    this.router.put('/firearms/:id', Authentication.handle, RequireAdmin.handle, FirearmController.update);
    this.router.delete('/firearms/:id', Authentication.handle, RequireAdmin.handle, FirearmController.destroy);

    // Firearm Issuances
    this.router.get('/firearm-issuances', Authentication.handle, RequireAdminOrHR.handle, FirearmIssuanceController.index);
    this.router.get('/firearm-issuances/:id', Authentication.handle, RequireAdminOrHR.handle, FirearmIssuanceController.show);
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

    // Companies
    this.router.get('/companies', Authentication.handle, CompanyController.index);
    this.router.get('/companies/:id', Authentication.handle, CompanyController.show);
    this.router.get('/companies/:id/guards', Authentication.handle, CompanyController.getGuards);
    this.router.post('/companies', Authentication.handle, RequireAdmin.handle, CompanyController.store);
    this.router.put('/companies/:id', Authentication.handle, RequireAdmin.handle, CompanyController.update);
    this.router.delete('/companies/:id', Authentication.handle, RequireAdmin.handle, CompanyController.destroy);

    // Archive (soft-delete management)
    this.router.get('/archive/:entity', Authentication.handle, RequireAdmin.handle, ArchiveController.index);
    this.router.post('/archive/:entity/:id/restore', Authentication.handle, RequireAdmin.handle, ArchiveController.restore);
    this.router.delete('/archive/:entity/:id', Authentication.handle, RequireAdmin.handle, ArchiveController.permanentDelete);

    // Reports
    this.router.get('/reports/guards', Authentication.handle, RequireAdminOrHR.handle, ReportController.guardReport);
    this.router.get('/reports/attendance', Authentication.handle, RequireAdminOrHR.handle, ReportController.attendanceReport);
    this.router.get('/reports/firearms', Authentication.handle, RequireAdminOrHR.handle, ReportController.firearmReport);
    this.router.get('/reports/companies', Authentication.handle, RequireAdminOrHR.handle, ReportController.companyReport);

    // Shift Rotation
    this.router.post('/shift-rotation/rotate', Authentication.handle, RequireAdmin.handle, ShiftRotationController.rotate);
    this.router.post('/shift-rotation/rotate/:companyId', Authentication.handle, RequireAdminOrHR.handle, ShiftRotationController.manualRotate);
    this.router.get('/shift-rotation/status', Authentication.handle, RequireAdminOrHR.handle, ShiftRotationController.status);

    // User Management (Admin/HR)
    this.router.get('/users', Authentication.handle, RequireAdmin.handle, UserManagementController.index);
    this.router.post('/users', Authentication.handle, RequireAdmin.handle, UserManagementController.store);
    this.router.put('/users/:id', Authentication.handle, RequireAdmin.handle, UserManagementController.update);
    this.router.delete('/users/:id', Authentication.handle, RequireAdmin.handle, UserManagementController.destroy);
  }
}

export default new ApiRoutes().router;