import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,
  addressSchema,
} from '../validators/authSchemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/google', authLimiter, validate(googleAuthSchema), AuthController.googleLogin);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.get('/me', authenticate, AuthController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.post('/addresses', authenticate, validate(addressSchema), AuthController.addAddress);
router.delete('/addresses/:addressId', authenticate, AuthController.deleteAddress);

export default router;

