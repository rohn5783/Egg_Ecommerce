import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class CouponController {
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, amount } = req.body;
      if (!code) return next(ApiError.badRequest('Coupon code is required'));

      const coupon = await Coupon.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
        expirationDate: { $gte: new Date() },
      });

      if (!coupon) {
        return next(ApiError.badRequest('Coupon is invalid or has expired'));
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return next(ApiError.badRequest('Coupon usage limit reached'));
      }

      const orderAmount = Number(amount) || 0;
      if (orderAmount < coupon.minOrderAmount) {
        return next(
          ApiError.badRequest(
            `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
          )
        );
      }

      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = Math.round((orderAmount * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = Math.min(coupon.discountValue, orderAmount);
      }

      return ApiResponse.success(res, {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount,
        description: coupon.description,
      }, 'Coupon is valid');
    } catch (err) {
      next(err);
    }
  }
}

