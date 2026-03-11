import { Request, Response, NextFunction } from 'express';
import ShiftRotationService from '../services/ShiftRotationService.js';
import ApiResponse from '../utils/ApiResponse.js';

class ShiftRotationController {
  /**
   * Trigger automatic shift rotation.
   */
  public async rotate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShiftRotationService.rotateShifts();
      return ApiResponse.success(res, result, 'Shift rotation completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manual shift rotation for a specific company.
   */
  public async manualRotate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = Number(req.params.companyId);
      const result = await ShiftRotationService.manualRotate(companyId);
      return ApiResponse.success(res, result, 'Manual shift rotation completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shift rotation status.
   */
  public async status(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await ShiftRotationService.getRotationStatus();
      return ApiResponse.success(res, status, 'Rotation status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ShiftRotationController();
