import { Router } from 'express';
import { runDraw } from '../controllers/drawController.js';
import { verifyWinner } from '../controllers/winnerController.js';
import { getUsers, getReports, manageCharity, getAdminDraws, getPendingWinners } from '../controllers/adminController.js';
import { authGuard } from '../middleware/authGuard.js';
import { adminGuard } from '../middleware/adminGuard.js';

const router = Router();

// All admin routes require auth + admin role
router.use(authGuard, adminGuard);

router.get('/users', getUsers);
router.get('/reports', getReports);
router.post('/run-draw', runDraw);
router.get('/draws', getAdminDraws);
router.get('/winners', getPendingWinners);
router.post('/verify-winner', verifyWinner);
router.post('/charities/:action', manageCharity);

export default router;
