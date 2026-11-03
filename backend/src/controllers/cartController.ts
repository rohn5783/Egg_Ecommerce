import { Response, NextFunction } from 'express';
import { Cart, ICart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class CartController {
  /**
   * Recalculates subtotal, delivery, coupon discount and final total server-side
   */
  private static async recalculateCart(cart: ICart): Promise<ICart> {
    let subtotal = 0;

    // Populate products to get verified prices and stock
    await cart.populate('items.product');

    // Filter out items whose product may have been deleted
    cart.items = cart.items.filter((item: any) => item.product != null);

    for (const item of cart.items as any[]) {
      const prod = item.product;
      const actualUnitPrice = prod.discountPrice || prod.price;
      item.price = actualUnitPrice;
      subtotal += actualUnitPrice * item.quantity;
    }

    cart.subtotal = subtotal;

    // Delivery charge rule: Free delivery for orders >= ₹499, otherwise ₹49
    cart.deliveryCharge = subtotal >= 499 || subtotal === 0 ? 0 : 49;

    // Recalculate Coupon Discount if applied
    let discount = 0;
    if (cart.appliedCoupon) {
      const coupon = await Coupon.findOne({
        code: cart.appliedCoupon,
        isActive: true,
        expirationDate: { $gte: new Date() },
      });

      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
      } else {
        cart.appliedCoupon = undefined;
      }
    }

    cart.discountTotal = discount;
    cart.finalTotal = Math.max(0, subtotal + cart.deliveryCharge - discount);

    await cart.save();
    return cart;
  }

  private static async getOrCreateCart(req: AuthRequest): Promise<ICart> {
    const guestId = (req.headers['x-guest-id'] as string) || req.body.guestId;

    let cart: ICart | null = null;
    if (req.userId) {
      cart = await Cart.findOne({ user: req.userId });
      // If user had a guest cart before logging in, merge it
      if (!cart && guestId) {
        cart = await Cart.findOne({ guestId });
        if (cart) {
          cart.user = req.userId as any;
          cart.guestId = undefined;
          await cart.save();
        }
      }
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      cart = new Cart({
        user: req.userId || undefined,
        guestId: req.userId ? undefined : guestId || `guest_${Date.now()}`,
        items: [],
      });
      await cart.save();
    }

    return cart;
  }

  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await CartController.getOrCreateCart(req);
      const recalculated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, recalculated);
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity = 1, customCartonConfig } = req.body;
      if (!productId) return next(ApiError.badRequest('ProductId is required'));

      const product = await Product.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        return next(ApiError.notFound('Product is unavailable or does not exist'));
      }

      if (product.stockQuantity < quantity) {
        return next(
          ApiError.badRequest(`Only ${product.stockQuantity} packs left in stock`)
        );
      }

      const cart = await CartController.getOrCreateCart(req);
      const existingItemIndex = cart.items.findIndex(
        (item: any) =>
          item.product.toString() === productId &&
          JSON.stringify(item.customCartonConfig) === JSON.stringify(customCartonConfig)
      );

      const actualPrice = product.discountPrice || product.price;

      if (existingItemIndex > -1) {
        const newQty = cart.items[existingItemIndex].quantity + quantity;
        if (newQty > product.stockQuantity) {
          return next(
            ApiError.badRequest(`Cannot add more than ${product.stockQuantity} units to cart`)
          );
        }
        cart.items[existingItemIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: product._id as any,
          quantity,
          customCartonConfig,
          price: actualPrice,
        });
      }

      const updated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, updated, 'Item added to cart');
    } catch (err) {
      next(err);
    }
  }

  static async updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return next(ApiError.badRequest('Quantity must be at least 1'));
      }

      const cart = await CartController.getOrCreateCart(req);
      const item = cart.items.find((i: any) => i._id.toString() === itemId);
      if (!item) return next(ApiError.notFound('Cart item not found'));

      const product = await Product.findById(item.product);
      if (product && quantity > product.stockQuantity) {
        return next(
          ApiError.badRequest(`Only ${product.stockQuantity} packs left in stock`)
        );
      }

      item.quantity = quantity;
      const updated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, updated, 'Cart updated');
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const cart = await CartController.getOrCreateCart(req);
      cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);

      const updated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, updated, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }

  static async applyCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const cart = await CartController.getOrCreateCart(req);

      const coupon = await Coupon.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
        expirationDate: { $gte: new Date() },
      });

      if (!coupon) {
        return next(ApiError.badRequest('Invalid or expired coupon code'));
      }

      if (cart.subtotal < coupon.minOrderAmount) {
        return next(
          ApiError.badRequest(
            `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
          )
        );
      }

      cart.appliedCoupon = coupon.code;
      const updated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, updated, `Coupon ${coupon.code} applied!`);
    } catch (err) {
      next(err);
    }
  }

  static async removeCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await CartController.getOrCreateCart(req);
      cart.appliedCoupon = undefined;
      const updated = await CartController.recalculateCart(cart);
      return ApiResponse.success(res, updated, 'Coupon removed');
    } catch (err) {
      next(err);
    }
  }
}

