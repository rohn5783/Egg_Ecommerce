import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ReviewController {
  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const reviews = await Review.find({ product: productId, isApproved: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, reviews);
    } catch (err) {
      next(err);
    }
  }

  static async addReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { rating, title, comment, images = [] } = req.body;

      // Check if user already reviewed this product
      const existing = await Review.findOne({ product: productId, user: req.userId });
      if (existing) {
        return next(ApiError.badRequest('You have already submitted a review for this product'));
      }

      // Check for verified purchase (order with DELIVERED or CONFIRMED containing this product)
      const hasPurchased = await Order.exists({
        user: req.userId,
        paymentStatus: 'PAID',
        'items.product': productId,
      });

      const review = await Review.create({
        product: productId,
        user: req.userId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase: Boolean(hasPurchased),
        isApproved: true,
      });

      // Recalculate product rating average & count
      const allReviews = await Review.find({ product: productId, isApproved: true });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(productId, {
        ratingsAverage: Math.round(avg * 10) / 10,
        ratingsCount: allReviews.length,
      });

      return ApiResponse.created(res, review, 'Review submitted successfully');
    } catch (err) {
      next(err);
    }
  }
}

