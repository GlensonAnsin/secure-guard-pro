import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService.js';
import ApiResponse from '../utils/ApiResponse.js';

class UserController {
  /**
   * Get paginated list of users.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const users = await UserService.getAllUsers(page, limit, search, status);
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single user by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(Number(req.params.id));
      if (!user) return ApiResponse.error(res, 'User not found', 404);
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      return ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a user.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(Number(req.params.id), req.body);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(Number(req.params.id));
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getGuardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await UserService.getGuardStats();
      return ApiResponse.success(res, stats, 'Stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();