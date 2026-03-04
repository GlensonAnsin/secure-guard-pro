import { Request, Response, NextFunction } from 'express';
import FirearmIssuanceService from '../services/FirearmIssuanceService.js';
import ApiResponse from '../utils/ApiResponse.js';

class FirearmIssuanceController {
  /**
   * Get paginated list of firearm issuances.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const issuances = await FirearmIssuanceService.getAllIssuances(page, limit);
      return ApiResponse.success(res, issuances, 'Firearm issuances retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single firearm issuance by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const issuance = await FirearmIssuanceService.getIssuanceById(Number(req.params.id));
      if (!issuance) return ApiResponse.error(res, 'Firearm issuance not found', 404);
      return ApiResponse.success(res, issuance, 'Firearm issuance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new firearm issuance.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const issuance = await FirearmIssuanceService.createIssuance(req.body);
      return ApiResponse.success(res, issuance, 'Firearm issuance created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a firearm issuance.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const issuance = await FirearmIssuanceService.updateIssuance(Number(req.params.id), req.body);
      return ApiResponse.success(res, issuance, 'Firearm issuance updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a firearm issuance.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await FirearmIssuanceService.deleteIssuance(Number(req.params.id));
      return ApiResponse.success(res, null, 'Firearm issuance deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new FirearmIssuanceController();
