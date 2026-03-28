import { Router } from 'express';
import { addScore, getScores, updateScore, deleteScore } from '../controllers/scoreController.js';
import { authGuard } from '../middleware/authGuard.js';
import { scoreLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', authGuard, scoreLimiter, addScore);
router.get('/', authGuard, getScores);
router.put('/:id', authGuard, updateScore);
router.delete('/:id', authGuard, deleteScore);

export default router;
