import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware (Double-Submit Cookie Pattern)
 * 
 * For web routes that handle state-changing requests.
 * API routes using Bearer token auth are inherently CSRF-safe.
 * 
 * How it works:
 * 1. On GET requests, generates a CSRF token and sets it as a cookie
 * 2. On state-changing requests (POST, PUT, PATCH, DELETE), validates
 *    that the x-csrf-token header matches the csrf_token cookie
 */
class Csrf {
  private cookieName = 'csrf_token';
  private headerName = 'x-csrf-token';
  private safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  /**
   * Generate and set CSRF token on safe requests.
   * Validate token on state-changing requests.
   */
  public handle = (req: Request, res: Response, next: NextFunction) => {
    if (this.safeMethods.includes(req.method)) {
      // Generate and set CSRF token cookie on safe methods
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(this.cookieName, token, {
        httpOnly: false, // Must be readable by client-side JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      return next();
    }

    // Validate CSRF token on state-changing methods
    const cookieToken = req.cookies?.[this.cookieName];
    const headerToken = req.headers[this.headerName] as string;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token validation failed',
      });
    }

    next();
  };
}

export default new Csrf();
