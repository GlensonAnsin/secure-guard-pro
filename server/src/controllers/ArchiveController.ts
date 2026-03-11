import { Request, Response, NextFunction } from 'express';
import ArchiveService from '../services/ArchiveService.js';
import ApiResponse from '../utils/ApiResponse.js';

class ArchiveController {
  /**
   * List archived (soft-deleted) records for an entity.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const entity = req.params.entity as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const result = await ArchiveService.getArchived(entity, page, limit);
      return ApiResponse.success(res, result, 'Archived records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a soft-deleted record.
   */
  public async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const entity = req.params.entity as string;
      const id = Number(req.params.id);
      const record = await ArchiveService.restore(entity, id);
      return ApiResponse.success(res, record, 'Record restored successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently delete a record.
   */
  public async permanentDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const entity = req.params.entity as string;
      const id = Number(req.params.id);
      await ArchiveService.permanentDelete(entity, id);
      return ApiResponse.success(res, null, 'Record permanently deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new ArchiveController();
