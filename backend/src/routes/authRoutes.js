import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { authGuard } from '../middleware/authGuard.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authGuard, logout);
router.get('/me', authGuard, getMe);

export default router;
