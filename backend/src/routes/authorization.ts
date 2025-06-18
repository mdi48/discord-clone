import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../generated/prisma/client';
import generateToken from '../utils/generateToken';
import { authMiddleware, AuthRequest } from '../middleware/auth';


const prisma = new PrismaClient();
const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid credentials' });
    } else {
        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, username: user.username } });
    }
});

authRoutes.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    const token = generateToken(newUser.id);
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
});

authRoutes.get('/me', authMiddleware, async (req, res) => {
    const { userId } = req as AuthRequest;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
    });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

export default authRoutes;
