import { Request, Response, NextFunction } from 'express';
import GuardViewService from '../services/GuardViewService.js';
import ApiResponse from '../utils/ApiResponse.js';

class GuardViewController {
    /**
     * Get a single user by ID.
     */
    public async show(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await GuardViewService.getUserById(Number(req.params.id));
            if (!user) return ApiResponse.error(res, 'User not found', 404);
            return ApiResponse.success(res, user, 'User retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new GuardViewController();