import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Custom Interface to extend Express Request with user identity.
 * This avoids using 'any' and maintains strict type safety.
 */
interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

/**
 * Auth Middleware - Intercepts requests to validate JWT Tokens.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
        
        // Technical refinement: Type casting to our custom interface
        (req as AuthRequest).user = decoded;
        
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};