import { Router } from 'express';
import authRoutes from './authorization';
import messageRoutes from './messages';
import channelRoutes from './channels';

const router = Router();

router.use('/api', authRoutes);
router.use('/api/channels', channelRoutes);
router.use('/api/messages', messageRoutes);

export default router;
