import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/product/:productId', authenticate, ReviewController.addReview);

export default router;

