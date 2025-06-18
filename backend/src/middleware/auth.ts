import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
    userId?: string; // Optional userId for authenticated requests
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void =>{
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Extract token from "Bearer <token>" format

    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    type TokenPayload = { userId: string };

    function isTokenPayload(obj: any): obj is TokenPayload {
        return obj === 'object' && typeof obj.userId === 'string';
    }

    try {
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
        }

        else {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (!isTokenPayload(decoded)) {
                res.status(403).json({ error: 'Invalid token payload' });
                return;
            }
            req.userId = decoded.userId; // Attach userId to the request object
            next(); // Call the next middleware or route handler
        }

    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
