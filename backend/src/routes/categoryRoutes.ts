import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';

const router = Router();

router.get('/', CategoryController.listCategories);

export default router;

