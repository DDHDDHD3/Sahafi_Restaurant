import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';

const router = Router();

router.get('/', profileController.get);
router.put('/', profileController.update);
router.post('/reset-demo', profileController.resetDemo);

export default router;
