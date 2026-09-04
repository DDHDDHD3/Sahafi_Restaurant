import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/overdue', dashboardController.getOverdue);
router.get('/top-debtors', dashboardController.getTopDebtors);

export default router;
