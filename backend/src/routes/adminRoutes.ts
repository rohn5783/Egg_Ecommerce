import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/productSchemas.js';
import { updateOrderStatusSchema } from '../validators/orderSchemas.js';
import { createCouponSchema } from '../validators/couponSchemas.js';

const router = Router();

// Apply auth and admin check to all admin routes
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Products
router.post('/products', validate(createProductSchema), AdminController.createProduct);
router.put('/products/:id', validate(updateProductSchema), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Orders
router.get('/orders', AdminController.listOrders);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), AdminController.updateOrderStatus);

// Inventory
router.get('/inventory', AdminController.listInventory);
router.post('/inventory/adjust', AdminController.adjustInventory);

// Coupons
router.get('/coupons', AdminController.listCoupons);
router.post('/coupons', validate(createCouponSchema), AdminController.createCoupon);
router.delete('/coupons/:id', AdminController.deleteCoupon);

// Reviews
router.get('/reviews', AdminController.listReviews);
router.put('/reviews/:id/toggle-approval', AdminController.toggleReviewApproval);

// Customers
router.get('/customers', AdminController.listCustomers);

// Content CMS
router.put('/content', AdminController.updateContent);

export default router;

