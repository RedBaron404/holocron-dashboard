import type { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    user?: {
      email: string;
      name?: string;
    };
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.SKIP_AUTH === 'true') {
    next();
    return;
  }
  if (!req.session.user?.email) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next();
}
