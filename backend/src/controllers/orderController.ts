import { Response, NextFunction } from 'express';
import { Order, IOrderItem } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Payment } from '../models/Payment.js';
import { AuthRequest } from '../middleware/auth.js';
import { RazorpayService } from '../services/razorpayService.js';
import { InventoryService } from '../services/inventoryService.js';
import { EmailService } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { shippingAddress, paymentMethod = 'RAZORPAY' } = req.body;

      // 1. Get user cart
      const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return next(ApiError.badRequest('Cannot checkout with an empty cart'));
      }

      // 2. Validate PIN code serviceability
      // All standard 6-digit PIN codes are accepted; for express farm morning delivery
      if (!/^\d{6}$/.test(shippingAddress.pincode)) {
        return next(ApiError.badRequest('Please enter a valid 6-digit PIN code for farm morning delivery'));
      }

      // 3. Verify stock & reserve inventory
      const orderNumber = `GE-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const orderItems: IOrderItem[] = [];
      for (const item of cart.items as any[]) {
        const prod = item.product;
        if (!prod || prod.status !== 'ACTIVE') {
          return next(ApiError.badRequest(`Item "${prod?.name || 'Unknown'}" is currently unavailable`));
        }

        // Reserve inventory atomically
        await InventoryService.reserveStock(
          prod._id.toString(),
          item.quantity,
          orderNumber
        );

        const unitPrice = prod.discountPrice || prod.price;
        orderItems.push({
          product: prod._id,
          name: prod.name,
          image: prod.images[0] || '',
          price: unitPrice,
          quantity: item.quantity,
          eggQuantity: prod.eggQuantity || 12,
          customCartonConfig: item.customCartonConfig,
          subtotal: unitPrice * item.quantity,
        });
      }

      // 4. Calculate final totals server-side
      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryCharge = subtotal >= 499 ? 0 : 49;
      const discountTotal = cart.discountTotal || 0;
      const finalTotal = Math.max(0, subtotal + deliveryCharge - discountTotal);

      // 5. Create Razorpay order if paymentMethod is RAZORPAY
      let razorpayOrderData: any = null;
      if (paymentMethod === 'RAZORPAY') {
        razorpayOrderData = await RazorpayService.createOrder(finalTotal, orderNumber, {
          orderNumber,
          userId: req.userId!,
        });
      }

      // 6. Create Order in database
      const order = await Order.create({
        orderNumber,
        user: req.userId,
        items: orderItems,
        shippingAddress,
        subtotal,
        deliveryCharge,
        discountTotal,
        appliedCoupon: cart.appliedCoupon,
        finalTotal,
        paymentStatus: 'PENDING',
        paymentMethod,
        razorpayOrderId: razorpayOrderData?.id,
        orderStatus: 'PENDING',
        timeline: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            note: 'Order placed, awaiting payment confirmation',
          },
        ],
      });

      return ApiResponse.created(res, {
        order,
        razorpay: razorpayOrderData,
      }, 'Order initialized successfully');
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return next(ApiError.badRequest('Missing required payment verification parameters'));
      }

      // 1. Fetch Order and verify existence & ownership
      const order = await Order.findById(orderId);
      if (!order) return next(ApiError.notFound('Order not found'));

      if (order.user.toString() !== req.userId) {
        return next(ApiError.forbidden('Unauthorized: You do not own this order'));
      }

      // 2. Prevent Double Payment / Duplicate Execution
      if (order.paymentStatus === 'PAID') {
        return ApiResponse.success(res, order, 'Order has already been paid and confirmed');
      }

      // 3. Verify Razorpay Order ID matches order record
      if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
        return next(ApiError.badRequest('Security violation: Razorpay order ID does not match order record'));
      }

      // 4. Anti-Fraud Replay Attack Check: Ensure payment ID has NEVER been used before
      const existingPayment = await Payment.findOne({ razorpayPaymentId });
      if (existingPayment) {
        return next(
          ApiError.conflict(
            'Payment fraud detected: This payment transaction ID has already been credited to another order'
          )
        );
      }

      const existingOrderByPayId = await Order.findOne({
        razorpayPaymentId,
        _id: { $ne: order._id },
      });
      if (existingOrderByPayId) {
        return next(
          ApiError.conflict(
            'Payment fraud detected: This payment transaction ID is already associated with another order'
          )
        );
      }

      // 5. Cryptographic HMAC-SHA256 Signature Verification
      const isValid = RazorpayService.verifySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return next(ApiError.badRequest('Payment verification failed: Invalid cryptographic signature'));
      }

      // 6. Direct Verification with Razorpay API (amount & currency check)
      const expectedAmountInPaise = Math.round(order.finalTotal * 100);
      const razorpayPaymentDetails = await RazorpayService.fetchPayment(razorpayPaymentId);

      if (razorpayPaymentDetails && !razorpayPaymentDetails.isMock) {
        // Verify Currency
        if (razorpayPaymentDetails.currency !== 'INR') {
          return next(ApiError.badRequest('Invalid payment currency: Only INR is accepted'));
        }

        // Verify Amount (prevents client-side amount tampering)
        if (razorpayPaymentDetails.amount !== expectedAmountInPaise) {
          return next(
            ApiError.badRequest(
              `Payment amount mismatch: Expected ₹${order.finalTotal} but received ₹${razorpayPaymentDetails.amount / 100}`
            )
          );
        }

        // Verify Razorpay Order ID link
        if (razorpayPaymentDetails.order_id && razorpayPaymentDetails.order_id !== razorpayOrderId) {
          return next(ApiError.badRequest('Payment record does not link to the corresponding order'));
        }

        // If status is authorized, capture it
        if (razorpayPaymentDetails.status === 'authorized') {
          await RazorpayService.capturePayment(razorpayPaymentId, expectedAmountInPaise);
        } else if (razorpayPaymentDetails.status !== 'captured') {
          return next(
            ApiError.badRequest(`Payment is not in captured status (current: ${razorpayPaymentDetails.status})`)
          );
        }
      }

      // 7. Update Order Status to PAID & CONFIRMED
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.razorpayPaymentId = razorpayPaymentId;
      order.timeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        note: `Payment verified via Razorpay ID: ${razorpayPaymentId}`,
      });
      await order.save();

      // 8. Create Immutable Payment Record
      await Payment.create({
        order: order._id,
        user: req.userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.finalTotal,
        currency: 'INR',
        status: 'CAPTURED',
      });

      // 9. Commit inventory deduction permanently
      for (const item of order.items) {
        await InventoryService.commitReservation(
          item.product.toString(),
          order.orderNumber
        );
      }

      // 10. Clear user cart
      await Cart.findOneAndUpdate(
        { user: req.userId },
        { items: [], subtotal: 0, finalTotal: 0, discountTotal: 0 }
      );

      // 11. Send Order Confirmation Email
      if (req.user?.email) {
        EmailService.sendOrderConfirmation(req.user.email, order).catch(() => {});
      }

      return ApiResponse.success(res, order, 'Payment strictly verified & order confirmed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
      return ApiResponse.success(res, orders);
    } catch (err) {
      next(err);
    }
  }

  static async getOrderDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const order = await Order.findOne({
        $or: [{ _id: isObjectId ? id : null }, { orderNumber: id }],
        user: req.userId,
      });

      if (!order) return next(ApiError.notFound('Order not found'));
      return ApiResponse.success(res, order);
    } catch (err) {
      next(err);
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({
        _id: id,
        user: req.userId,
      });

      if (!order) return next(ApiError.notFound('Order not found'));

      // Check eligibility (only PENDING or CONFIRMED can be cancelled)
      if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
        return next(
          ApiError.badRequest(
            `Cannot cancel order in '${order.orderStatus}' status. Contact support.`
          )
        );
      }

      // Release inventory reservations
      for (const item of order.items) {
        await InventoryService.releaseReservation(item.product.toString(), order.orderNumber);
      }

      order.orderStatus = 'CANCELLED';
      order.cancellationReason = reason || 'Cancelled by customer';
      order.timeline.push({
        status: 'CANCELLED',
        timestamp: new Date(),
        note: `Order cancelled. Reason: ${order.cancellationReason}`,
      });

      if (order.paymentStatus === 'PAID') {
        order.paymentStatus = 'REFUNDED';
      }

      await order.save();
      return ApiResponse.success(res, order, 'Order cancelled successfully');
    } catch (err) {
      next(err);
    }
  }
}
