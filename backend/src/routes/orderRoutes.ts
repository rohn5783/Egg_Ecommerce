import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema } from '../validators/orderSchemas.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(checkoutSchema), OrderController.createOrder);
router.post('/verify-payment', OrderController.verifyPayment);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderDetails);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;

