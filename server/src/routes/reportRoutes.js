import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const router = Router();

router.get('/monthly', reportController.getMonthly);
router.get('/customer/:id', reportController.getCustomerReport);

export default router;
