import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CategoryController {
  static async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
      return ApiResponse.success(res, categories);
    } catch (err) {
      next(err);
    }
  }
}

