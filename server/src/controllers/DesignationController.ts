import { Request, Response, NextFunction } from 'express';
import DesignationService from '../services/DesignationService.js';
import ApiResponse from '../utils/ApiResponse.js';

class DesignationController {
  /**
   * Get paginated list of designations.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const designations = await DesignationService.getAllDesignations(page, limit);
      return ApiResponse.success(res, designations, 'Designations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single designation by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const designation = await DesignationService.getDesignationById(Number(req.params.id));
      if (!designation) return ApiResponse.error(res, 'Designation not found', 404);
      return ApiResponse.success(res, designation, 'Designation retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new designation.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const designation = await DesignationService.createDesignation(req.body);
      return ApiResponse.success(res, designation, 'Designation created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a designation.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const designation = await DesignationService.updateDesignation(Number(req.params.id), req.body);
      return ApiResponse.success(res, designation, 'Designation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a designation.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await DesignationService.deleteDesignation(Number(req.params.id));
      return ApiResponse.success(res, null, 'Designation deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new DesignationController();
