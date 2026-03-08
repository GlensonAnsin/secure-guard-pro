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

    /**
     * Update a user's status by ID.
     */
    public async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.body;
            
            if (!status || typeof status !== 'string') {
                return ApiResponse.error(res, 'Status is required and must be a string', 400);
            }

            const validStatuses = ['active', 'inactive', 'on_leave', 'assigned', 'resigned'];
            if (!validStatuses.includes(status)) {
                return ApiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
            }

            const updatedUser = await GuardViewService.updateUserStatus(Number(req.params.id), status);
            
            if (!updatedUser) {
                return ApiResponse.error(res, 'User not found', 404);
            }

            return ApiResponse.success(res, updatedUser, 'Guard status updated successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new GuardViewController();