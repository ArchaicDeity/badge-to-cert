import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: {
    role?: string;
    [key: string]: unknown;
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
