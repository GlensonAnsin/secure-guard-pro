import { Request, Response, NextFunction } from 'express';

class RequireAdminOrHR {
  public static handle(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;

    if (!user || !user.roles || (!user.roles.includes('admin') && !user.roles.includes('hr'))) {
      res.status(403).json({
        status: 403,
        success: false,
        message: 'Forbidden. Admin or HR access required.',
      });
      return;
    }

    next();
  }
}

export default RequireAdminOrHR;
