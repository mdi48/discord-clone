import { Router, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const messageRoutes = Router();

 // update return type to not be any

messageRoutes.get('/:channelId/messages', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: { channelId },
            include: {
                user: { select: { id: true, username: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        res.json(messages);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch messages' });
        return;
    }
});

messageRoutes.post('/:channelId/messages', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { content } = req.body;
    const { userId } = req;

    if (!userId) {
        throw new Error('User ID is required for creating a message');
    }
    if (typeof content !== 'string' || content.trim() === '') {
        res.status(400).json({ error: 'Message content cannot be empty' });
        return;
    }

    try {
        const message = await prisma.message.create({
            data: { content, channelId, userId },
            include: {
                user: { select: { id: true, username: true } },
            },
        });

        res.status(201).json(message);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create message' });
        return;
    }
});

export default messageRoutes;
