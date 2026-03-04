import { Request, Response, NextFunction } from 'express';
import AttendanceService from '../services/AttendanceService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AttendanceController {
  /**
   * Get paginated list of attendances.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const attendances = await AttendanceService.getAllAttendances(page, limit);
      return ApiResponse.success(res, attendances, 'Attendances retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single attendance by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.getAttendanceById(Number(req.params.id));
      if (!attendance) return ApiResponse.error(res, 'Attendance not found', 404);
      return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new attendance.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.createAttendance(req.body);
      return ApiResponse.success(res, attendance, 'Attendance created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an attendance.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.updateAttendance(Number(req.params.id), req.body);
      return ApiResponse.success(res, attendance, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an attendance.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await AttendanceService.deleteAttendance(Number(req.params.id));
      return ApiResponse.success(res, null, 'Attendance deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
