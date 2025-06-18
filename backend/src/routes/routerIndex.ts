import { Router } from 'express';
import authRoutes from './authorization';
import messageRoutes from './messages';

const router = Router();

router.use('/api', authRoutes);
router.use('/api/channels', messageRoutes);

export default router;
