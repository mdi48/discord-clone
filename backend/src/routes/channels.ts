import { Router, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const channelRoutes = Router();

channelRoutes.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const channels = await prisma.channel.findMany({
            select: { id: true, name: true }
        });
        res.json(channels);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch channels' });
        return;
    }
});

export default channelRoutes;
