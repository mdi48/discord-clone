"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key'; // Use a default secret for development
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1]; // Extract token from "Bearer <token>" format
    function isTokenPayload(obj) {
        return obj === 'object' && typeof obj.userId === 'string';
    }
    try {
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
        }
        else {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!isTokenPayload(decoded)) {
                res.status(403).json({ error: 'Invalid token payload' });
                return;
            }
            req.userId = decoded.userId; // Attach userId to the request object
            next(); // Call the next middleware or route handler
        }
    }
    catch (_a) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
