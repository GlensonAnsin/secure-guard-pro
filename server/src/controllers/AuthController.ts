import { Request, Response } from 'express';
import AuthService from '../services/AuthService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AuthController {
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  public async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', 400);
      }

      const result = await AuthService.refresh(refreshToken);
      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', 400);
      }

      await AuthService.logout(refreshToken);
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  public async me(req: Request, res: Response) {
    return ApiResponse.success(res, req.user);
  }

  public async changePassword(req: Request, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = (req.user as any)?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      if (!oldPassword || !newPassword) {
        return ApiResponse.error(res, 'Old and new passwords are required', 400);
      }

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);
      return ApiResponse.success(res, result, 'Password changed successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

export default new AuthController();