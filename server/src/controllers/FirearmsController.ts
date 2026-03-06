import { Request, Response, NextFunction } from "express";
import FirearmsService from "../services/FirearmsService.js";
import ApiResponse from "../utils/ApiResponse.js";

class FirearmsController {
  /**
   * Get paginated list of firearms.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const firearms = await FirearmsService.getAllFirearms(page, limit);
      return ApiResponse.success(
        res,
        firearms,
        "Firearms retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single firearm by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const firearm = await FirearmsService.getFirearmById(
        Number(req.params.id),
      );
      if (!firearm) return ApiResponse.error(res, "Firearm not found", 404);
      return ApiResponse.success(
        res,
        firearm,
        "Firearm retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new firearm.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const firearm = await FirearmsService.createFirearm(req.body);
      return ApiResponse.success(
        res,
        firearm,
        "Firearm created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a firearm.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const firearm = await FirearmsService.updateFirearm(
        Number(req.params.id),
        req.body,
      );
      return ApiResponse.success(res, firearm, "Firearm updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a firearm.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await FirearmsService.deleteFirearm(Number(req.params.id));
      return ApiResponse.success(res, null, "Firearm deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new FirearmsController();
