import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '../generated/prisma/client';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


// example for an auth endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username }, });
    if (!user || user.password !== password) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
});

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    socket.on('join', (channelId) => {
        socket.join(channelId);
    });
    socket.on('message', async ({ channelId, content, userId }) => {
        const message = await prisma.message.create({
            data: { channelId, content, userId },
        });
        io.to(channelId).emit('message', message);
    });
});


const PORT = 3808;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
