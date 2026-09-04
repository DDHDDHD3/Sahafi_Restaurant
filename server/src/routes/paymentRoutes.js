import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.get('/', paymentController.list);
router.post('/', paymentController.create);
router.delete('/:id', paymentController.delete);

export default router;
