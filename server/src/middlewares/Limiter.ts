import rateLimit from 'express-rate-limit';
import ApiResponse from '../utils/ApiResponse.js';

class Limiter {
  /**
   * General limiter for the entire API.
   * Allows 100 requests per 15 minutes.
   */
  public static global = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return ApiResponse.error(res, 'Too many requests, please try again later.', 429);
    },
  });

  /**
   * Strict limiter for sensitive routes (Login/Register).
   * Allows 5 attempts per hour.
   */
  public static auth = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return ApiResponse.error(res, 'Too many login attempts, please try again after an hour.', 429);
    },
  });
}

export default Limiter;