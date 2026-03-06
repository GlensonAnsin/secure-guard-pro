import { Request, Response, NextFunction } from "express";
import DashboardService from "../services/DashboardService.js";
import ApiResponse from "../utils/ApiResponse.js";

class DashboardController {
  /**
   * Get guard statistics for the dashboard.
   */
  public async getGuardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getGuardStats();
      return ApiResponse.success(res, stats, "Stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
