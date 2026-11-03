import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { applyCouponSchema } from '../validators/couponSchemas.js';

const router = Router();

router.use(optionalAuth);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:itemId', CartController.updateQuantity);
router.delete('/items/:itemId', CartController.removeItem);
router.post('/coupon', validate(applyCouponSchema), CartController.applyCoupon);
router.delete('/coupon', CartController.removeCoupon);

export default router;

