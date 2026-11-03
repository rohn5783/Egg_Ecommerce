import { Router } from 'express';
import { ContentController } from '../controllers/contentController.js';

const router = Router();

router.get('/home', ContentController.getHomeContent);
router.post('/newsletter', ContentController.subscribeNewsletter);

export default router;

