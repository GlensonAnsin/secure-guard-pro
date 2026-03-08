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

  /**
   * Get all dashboard data
   */
  public async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardData();
      return ApiResponse.success(res, data, "Dashboard data retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 20;
      const data = await DashboardService.getRecentActivities(limit);
      return ApiResponse.success(res, data, "Recent activities retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
