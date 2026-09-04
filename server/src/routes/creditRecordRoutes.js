import { Router } from 'express';
import { creditRecordController } from '../controllers/creditRecordController.js';

const router = Router();

router.get('/', creditRecordController.list);
router.get('/:id', creditRecordController.getById);
router.post('/', creditRecordController.create);
router.put('/:id', creditRecordController.update);
router.delete('/:id', creditRecordController.delete);

export default router;
