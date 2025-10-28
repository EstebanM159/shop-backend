import { Router } from 'express';
import { FileController } from '../controllers/FileController';

const router = Router();

router.post('/', FileController.fileProducts);
export default router;
