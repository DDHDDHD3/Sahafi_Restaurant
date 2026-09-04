import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', customerController.list);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);
router.post('/:id/settle', customerController.settleFullDebt);

export default router;
