import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { ApiError } from '../utils/apiError.js';

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Administrative privileges required to access this endpoint'));
  }
  next();
};

