import { Request, Response, NextFunction } from 'express';
import MobileService from '../services/MobileService.js';
import ApiResponse from '../utils/ApiResponse.js';

class MobileController {
  /**
   * Get authenticated guard's profile with current designation.
   */
  public async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const profile = await MobileService.getGuardProfile(userId);
      return ApiResponse.success(res, profile, 'Profile retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * Time in for the guard.
   */
  public async timeIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { designation_id } = req.body;

      if (!designation_id) {
        return ApiResponse.error(res, 'Designation ID is required', 400);
      }

      const attendance = await MobileService.timeIn(designation_id);
      return ApiResponse.success(res, attendance, 'Timed in successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * Time out for the guard.
   */
  public async timeOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { attendance_id } = req.body;

      if (!attendance_id) {
        return ApiResponse.error(res, 'Attendance ID is required', 400);
      }

      const attendance = await MobileService.timeOut(attendance_id);
      return ApiResponse.success(res, attendance, 'Timed out successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

export default new MobileController();
