import { Response, NextFunction } from 'express';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { Content } from '../models/Content.js';
import { AuthRequest } from '../middleware/auth.js';
import { InventoryService } from '../services/inventoryService.js';
import { EmailService } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class AdminController {
  /**
   * Real-time dashboard statistics
   */
  static async getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        revenueData,
        lowStockCount,
        recentOrders,
      ] = await Promise.all([
        Order.countDocuments(),
        User.countDocuments({ role: 'CUSTOMER' }),
        Product.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: ['PENDING', 'PROCESSING', 'PACKED'] } }),
        Order.countDocuments({ orderStatus: 'DELIVERED' }),
        Order.aggregate([
          { $match: { paymentStatus: 'PAID' } },
          { $group: { _id: null, totalRevenue: { $sum: '$finalTotal' } } },
        ]),
        Inventory.countDocuments({ $expr: { $lte: ['$currentStock', '$lowStockThreshold'] } }),
        Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
      ]);

      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

      // Calculate 7-day revenue trend
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dailyRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'PAID' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$finalTotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return ApiResponse.success(res, {
        stats: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          pendingOrders,
          deliveredOrders,
          lowStockCount,
        },
        dailyRevenue,
        recentOrders,
      });
    } catch (err) {
      next(err);
    }
  }

  // ================= PRODUCTS CRUD =================
  static async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const productData = req.body;
      const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      productData.slug = `${slug}-${Date.now().toString(36)}`;

      const product = await Product.create(productData);

      // Create linked inventory
      await Inventory.create({
        product: product._id,
        currentStock: product.stockQuantity || 50,
        lowStockThreshold: 15,
      });

      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      if (!product) return next(ApiError.notFound('Product not found'));

      if (req.body.stockQuantity !== undefined) {
        await Inventory.findOneAndUpdate(
          { product: product._id },
          { currentStock: req.body.stockQuantity }
        );
      }

      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product) return next(ApiError.notFound('Product not found'));

      await Inventory.findOneAndDelete({ product: id });
      return ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // ================= ORDERS MANAGEMENT =================
  static async listOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 15;
      const status = req.query.status as string;

      const filter: any = {};
      if (status && status !== 'all') {
        filter.orderStatus = status;
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('user', 'name email phone')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Order.countDocuments(filter),
      ]);

      return ApiResponse.paginated(res, orders, page, limit, total);
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const order = await Order.findById(id).populate('user', 'email name');
      if (!order) return next(ApiError.notFound('Order not found'));

      order.orderStatus = status;
      order.timeline.push({
        status,
        timestamp: new Date(),
        note: note || `Order updated to ${status} by admin`,
      });

      if (status === 'DELIVERED') {
        order.paymentStatus = 'PAID';
      }

      await order.save();

      // Dispatch status update email to customer
      if (order.user && (order.user as any).email) {
        EmailService.sendStatusUpdate((order.user as any).email, order, status, note).catch(() => {});
      }

      return ApiResponse.success(res, order, `Order status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  // ================= INVENTORY MANAGEMENT =================
  static async listInventory(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const inventory = await Inventory.find().populate('product', 'name sku images price stockQuantity');
      const movements = await InventoryMovement.find().populate('product', 'name sku').sort({ createdAt: -1 }).limit(20);
      return ApiResponse.success(res, { inventory, movements });
    } catch (err) {
      next(err);
    }
  }

  static async adjustInventory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, currentStock, reason } = req.body;
      await InventoryService.adjustStock(productId, currentStock, req.userId!, reason);
      const updated = await Inventory.findOne({ product: productId }).populate('product');
      return ApiResponse.success(res, updated, 'Inventory stock adjusted');
    } catch (err) {
      next(err);
    }
  }

  // ================= COUPONS CRUD =================
  static async listCoupons(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return ApiResponse.success(res, coupons);
    } catch (err) {
      next(err);
    }
  }

  static async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await Coupon.create(req.body);
      return ApiResponse.created(res, coupon, 'Coupon created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await Coupon.findByIdAndDelete(id);
      return ApiResponse.success(res, null, 'Coupon deleted');
    } catch (err) {
      next(err);
    }
  }

  // ================= REVIEWS MODERATION =================
  static async listReviews(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await Review.find()
        .populate('product', 'name images')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      return ApiResponse.success(res, reviews);
    } catch (err) {
      next(err);
    }
  }

  static async toggleReviewApproval(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);
      if (!review) return next(ApiError.notFound('Review not found'));

      review.isApproved = !review.isApproved;
      await review.save();
      return ApiResponse.success(res, review, `Review ${review.isApproved ? 'approved' : 'hidden'}`);
    } catch (err) {
      next(err);
    }
  }

  // ================= CUSTOMERS MANAGEMENT =================
  static async listCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = 20;
      const [customers, total] = await Promise.all([
        User.find({ role: 'CUSTOMER' })
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        User.countDocuments({ role: 'CUSTOMER' }),
      ]);
      return ApiResponse.paginated(res, customers, page, limit, total);
    } catch (err) {
      next(err);
    }
  }

  // ================= CONTENT CMS =================
  static async updateContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, data } = req.body;
      const content = await Content.findOneAndUpdate(
        { key },
        { data, updatedBy: req.userId },
        { upsert: true, new: true }
      );
      return ApiResponse.success(res, content, `Content '${key}' updated successfully`);
    } catch (err) {
      next(err);
    }
  }
}

