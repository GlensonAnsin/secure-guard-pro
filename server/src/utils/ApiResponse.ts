import { Response } from 'express';

class ApiResponse {
  /**
   * Send a standard success response.
   */
  public success(res: Response, data: any, message: string = 'Success', code: number = 200) {
    return res.status(code).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a standard error response.
   */
  public error(res: Response, message: string = 'Error', code: number = 400, errors: any = null) {
    return res.status(code).json({
      success: false,
      message,
      errors,
    });
  }
}

export default new ApiResponse();