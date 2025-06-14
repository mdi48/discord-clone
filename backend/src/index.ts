import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '../generated/prisma/client';
import { authMiddleware, AuthRequest } from './middleware/auth';

dotenv.config();
function generateToken(userId: string) {
    const secret = process.env.JWT_SECRET!;
    return jwt.sign({ userId }, secret, { expiresIn: '1h' });
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true,
    },
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


// example for an auth endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username }, });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid credentials' });
    } else {
        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, username: user.username } });
    }


});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
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

app.get('/api/me', authMiddleware, async (req, res) => {
    const { userId } = req as AuthRequest;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }, // password ommitted for security reasons
    });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    } else {
        res.json(user);
    }
});

app.get('/api/channels/:channelId/messages', authMiddleware, async (req, res) => {
    const { channelId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: { channelId },
            include: {
                user: {
                    select: { id: true, username: true }, // Include user info but not password
                },
            },
            orderBy: { createdAt: 'asc' }, // Order messages by creation time
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch messages' });
    }
});

app.post('/api/channels/:channelId/messages', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const { userId } = req as AuthRequest;
    if (!userId) { // Ensure userId is available
        throw new Error('User ID is required for creating a message');
    }
    if (!content || content.trim() === '') {
        res.status(400).json({ error: 'Message content cannot be empty' });
    }
    const message = await prisma.message.create({
        include: {
            user: {
                select: { id: true, username: true }, // Include user info but not password
            },
        },
        data: {
            content,
            channelId: id,
            userId,
        },
    });

});

// For later (:id is the server ID)
// app.get('/api/servers', authMiddleware, async (req, res) => { // gets all servers for the authenticated user
// app.post('/api/servers', authMiddleware, async (req, res) => { // creates a server
// app.post('/api/servers/:id/join', authMiddleware, async (req, res) => { // joins a server
// app.get('/api/servers/:id/channels', authMiddleware, async (req, res) => { // gets channels for a server
// app.post('/api/servers/:id/channels', authMiddleware, async (req, res) => { // creates a channel


io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    
    socket.on('join', (channelId) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    socket.on('message', async ({ channelId, content, userId }) => {
        const message = await prisma.message.create({
            data: { channelId, content, userId },
            include: { user: true } // Include username via relation
        });

        io.to(channelId).emit('message', {
            id: message.id,
            content: message.content,
            userId: message.userId,
            username: message.user.username,
            createdAt: message.createdAt,
            channelId: message.channelId
        });
    });
});


const PORT = 3808;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
