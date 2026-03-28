import { Router } from 'express';
import { submitProof, getMyWins } from '../controllers/winnerController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.post('/proof', authGuard, submitProof);
router.get('/my-wins', authGuard, getMyWins);

export default router;
