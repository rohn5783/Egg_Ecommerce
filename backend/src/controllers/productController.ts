import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ProductController {
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 12;
      const skip = (page - 1) * limit;

      const {
        category,
        eggType,
        minPrice,
        maxPrice,
        search,
        sort = 'newest',
        featured,
      } = req.query;

      const filter: any = { status: 'ACTIVE' };

      // Category filter (by slug or id)
      if (category && category !== 'all') {
        const catDoc = await Category.findOne({
          $or: [{ slug: category }, { _id: category.toString().match(/^[0-9a-fA-F]{24}$/) ? category : null }],
        });
        if (catDoc) {
          filter.category = catDoc._id;
        }
      }

      // Egg type filter
      if (eggType && eggType !== 'all') {
        filter.eggType = eggType;
      }

      // Price filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // Featured filter
      if (featured === 'true') {
        filter.isFeatured = true;
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
        ];
      }

      // Sorting
      let sortOption: any = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { ratingsAverage: -1 };
      else if (sort === 'oldest') sortOption = { createdAt: 1 };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .sort(sortOption)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      return ApiResponse.paginated(res, products, page, limit, total);
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug }).populate('category', 'name slug');
      if (!product) {
        return next(ApiError.notFound(`Product with slug '${slug}' not found`));
      }
      return ApiResponse.success(res, product);
    } catch (err) {
      next(err);
    }
  }

  static async getFeaturedProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const featured = await Product.find({ status: 'ACTIVE', isFeatured: true })
        .populate('category', 'name slug')
        .limit(8);
      return ApiResponse.success(res, featured);
    } catch (err) {
      next(err);
    }
  }

  static async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) return next(ApiError.notFound('Product not found'));

      const related = await Product.find({
        _id: { $ne: product._id },
        status: 'ACTIVE',
        $or: [{ category: product.category }, { eggType: product.eggType }],
      })
        .limit(4)
        .populate('category', 'name slug');

      return ApiResponse.success(res, related);
    } catch (err) {
      next(err);
    }
  }
}

