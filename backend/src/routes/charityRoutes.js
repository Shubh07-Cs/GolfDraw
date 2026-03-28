import { Router } from 'express';
import { getCharities, selectCharity, getMyContributions } from '../controllers/charityController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.get('/', getCharities); // Public
router.post('/select', authGuard, selectCharity);
router.get('/contributions', authGuard, getMyContributions);

export default router;
