import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { Product } from '../models/Product.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class SubscriptionController {
  static async createSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ApiError(401, 'Authentication required');

      const { productId, quantity = 1, frequency = 'WEEKLY', deliveryDay = 'SUNDAY', deliveryAddress } = req.body;

      if (!productId) throw new ApiError(400, 'Product ID is required');
      if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.street) {
        throw new ApiError(400, 'Valid delivery address is required');
      }

      const product = await Product.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new ApiError(404, 'Product not found or unavailable');
      }

      // Calculate next delivery date (next occurrence of deliveryDay)
      const now = new Date();
      const nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const pricePerDelivery = (product.discountPrice || product.price) * quantity;

      const subscription = await Subscription.create({
        user: userId,
        product: product._id,
        quantity,
        frequency,
        deliveryDay,
        deliveryAddress,
        status: 'ACTIVE',
        pricePerDelivery,
        nextDeliveryDate: nextDate,
      });

      const populated = await Subscription.findById(subscription._id).populate('product');

      return ApiResponse.success(res, populated, 'Subscription created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMySubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ApiError(401, 'Authentication required');

      const subscriptions = await Subscription.find({ user: userId })
        .populate('product')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, subscriptions, 'Subscriptions fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { status, frequency, deliveryDay } = req.body;

      const subscription = await Subscription.findOne({ _id: id, user: userId });
      if (!subscription) throw new ApiError(404, 'Subscription not found');

      if (status) subscription.status = status;
      if (frequency) subscription.frequency = frequency;
      if (deliveryDay) subscription.deliveryDay = deliveryDay;

      await subscription.save();
      const updated = await Subscription.findById(id).populate('product');

      return ApiResponse.success(res, updated, 'Subscription updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const subscription = await Subscription.findOne({ _id: id, user: userId });
      if (!subscription) throw new ApiError(404, 'Subscription not found');

      subscription.status = 'CANCELLED';
      await subscription.save();

      return ApiResponse.success(res, subscription, 'Subscription cancelled');
    } catch (err) {
      next(err);
    }
  }

  static async getAllSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscriptions = await Subscription.find()
        .populate('user', 'name email phone')
        .populate('product')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, subscriptions, 'All subscriptions retrieved');
    } catch (err) {
      next(err);
    }
  }
}
