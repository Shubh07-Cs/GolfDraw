import { Router } from 'express';
import { getDrawResults, getLatestDraw } from '../controllers/drawController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.get('/', authGuard, getDrawResults);
router.get('/latest', authGuard, getLatestDraw);

export default router;
