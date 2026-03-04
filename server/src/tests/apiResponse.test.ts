import { describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import ApiResponse from '../utils/ApiResponse.js';

// Create a mock Response object
function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('ApiResponse', () => {
  describe('success', () => {
    it('should return a success response with default values', () => {
      const res = createMockResponse();
      ApiResponse.success(res as Response, { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });

    it('should return a success response with custom message and code', () => {
      const res = createMockResponse();
      ApiResponse.success(res as Response, { id: 1 }, 'Created', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        data: { id: 1 },
      });
    });
  });

  describe('error', () => {
    it('should return an error response with default values', () => {
      const res = createMockResponse();
      ApiResponse.error(res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        errors: null,
      });
    });

    it('should return an error response with custom values', () => {
      const res = createMockResponse();
      const errors = [{ field: 'email', message: 'Invalid' }];
      ApiResponse.error(res as Response, 'Validation Failed', 422, errors);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Failed',
        errors,
      });
    });
  });
});
