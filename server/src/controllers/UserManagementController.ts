import { Request, Response, NextFunction } from 'express';
import UserManagementService from '../services/UserManagementService.js';
import ApiResponse from '../utils/ApiResponse.js';

class UserManagementController {
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const search = req.query.search as string;
      const users = await UserManagementService.getAllUsers(page, limit, search);
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserManagementService.createUser(req.body);
      return ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserManagementService.updateUser(Number(req.params.id), req.body);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await UserManagementService.deleteUser(Number(req.params.id));
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserManagementController();
