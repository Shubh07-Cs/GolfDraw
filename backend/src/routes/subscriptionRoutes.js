import { Router } from 'express';
import { subscribe, getSubscriptionStatus, manageSubscription } from '../controllers/subscriptionController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.post('/', authGuard, subscribe);
router.get('/status', authGuard, getSubscriptionStatus);
router.post('/portal', authGuard, manageSubscription);

export default router;
