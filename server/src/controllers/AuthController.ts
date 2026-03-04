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
}

export default new AuthController();