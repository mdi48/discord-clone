"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("../generated/prisma/client");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
function generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '1h' });
}
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true,
    },
});
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// example for an auth endpoint
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield prisma.user.findUnique({ where: { username }, });
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
    else {
        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, username: user.username } });
    }
}));
app.post('/api/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
    }
    const existingUser = yield prisma.user.findUnique({ where: { username } });
    if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = yield prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });
    const token = generateToken(newUser.id);
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
}));
app.get('/api/me', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }, // password ommitted for security reasons
    });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    }
    else {
        res.json(user);
    }
}));
app.get('/api/channels/:id/messages', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const messages = yield prisma.message.findMany({
        where: { channelId: id },
        include: {
            user: {
                select: { id: true, username: true }, // Include user info but not password
            },
        },
        orderBy: { createdAt: 'asc' }, // Order messages by creation time
    });
    res.json(messages);
}));
app.post('/api/channels/:id/messages', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { content } = req.body;
    const { userId } = req;
    if (!userId) { // Ensure userId is available
        throw new Error('User ID is required for creating a message');
    }
    if (!content || content.trim() === '') {
        res.status(400).json({ error: 'Message content cannot be empty' });
    }
    const message = yield prisma.message.create({
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
}));
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
    socket.on('message', (_a) => __awaiter(void 0, [_a], void 0, function* ({ channelId, content, userId }) {
        const message = yield prisma.message.create({
            data: { channelId, content, userId },
            include: { user: true } // Include user info in the message
        });
        io.to(channelId).emit('message', {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            user: {
                id: message.user.id,
                username: message.user.username,
            },
        });
    }));
});
const PORT = 3808;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
