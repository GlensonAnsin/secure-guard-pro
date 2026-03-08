import { Request, Response, NextFunction } from 'express';

class RequireAdmin {
  public static handle(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
      res.status(403).json({
        status: 403,
        success: false,
        message: 'Forbidden. Admin access required.',
      });
      return;
    }

    next();
  }
}

export default RequireAdmin;
