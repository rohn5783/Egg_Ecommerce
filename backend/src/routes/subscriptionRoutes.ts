import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Customer subscription routes
router.post('/', authenticate, SubscriptionController.createSubscription);
router.get('/my', authenticate, SubscriptionController.getMySubscriptions);
router.patch('/:id', authenticate, SubscriptionController.updateSubscription);
router.delete('/:id', authenticate, SubscriptionController.cancelSubscription);

// Admin subscription overview
router.get('/admin', authenticate, requireAdmin, SubscriptionController.getAllSubscriptions);

export default router;
