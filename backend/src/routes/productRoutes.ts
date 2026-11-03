import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

router.get('/', ProductController.listProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.get('/:id/related', ProductController.getRelatedProducts);

export default router;

