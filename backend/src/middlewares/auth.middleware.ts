import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Ensure JWT_SECRET is treated as a string to avoid ts(2769)
const JWT_SECRET: string = process.env.JWT_SECRET || 'super-secret-key-2026';

/**
 * Token payload structure for type safety.
 */
interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

/**
 * Middleware to validate JWT and protect routes.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // FIX: Explicit check to ensure token is not undefined before verification
    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        // 1. Verify token using the guaranteed string secret
        // 2. Cast the result to our TokenPayload interface
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
        
        // 3. Attach decoded user data to the request object using a safe cast
        (req as Request & { user: TokenPayload }).user = decoded;

        next();
    } catch {
        // We catch without 'err' variable to avoid ESLint 'unused-vars' warning
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};