import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routerIndex';
import { z } from 'zod';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const envSchema = z.object({
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    PORT: z.string().regex(/^\d+$/).transform(Number).default('3808'),
});

const parsedEnv = envSchema.safeParse(process.env);
if(!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

const { JWT_SECRET, PORT } = parsedEnv.data;



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
app.use(routes);


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

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
