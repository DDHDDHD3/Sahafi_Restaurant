import { Router } from 'express';
import customerRoutes from './customerRoutes.js';
import creditRecordRoutes from './creditRecordRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import profileRoutes from './profileRoutes.js';
import { isUsingPrisma } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isUsingPrisma() ? 'PostgreSQL (Prisma)' : 'In-Memory (Seeded Fallback)'
  });
});

router.use('/customers', customerRoutes);
router.use('/records', creditRecordRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/profile', profileRoutes);

export default router;
