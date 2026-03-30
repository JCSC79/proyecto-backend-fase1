import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.ts';

/**
 * AuthController - Handles incoming authentication requests.
 * Orchestrates the flow between HTTP and Business Logic.
 */
class AuthController {
    /**
     * Handles the login process.
     * POST /api/auth/login
     */
    async login(req: Request, res: Response): Promise<Response | void> {
        const { email, password } = req.body;

        // Basic validation before hitting the service
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await authService.validateUser(email, password);

        if (result.isFailure) {
            // 401 Unauthorized for invalid credentials
            return res.status(401).json({ error: result.error });
        }

        // Successful authentication
        const { user, token } = result.getValue();

        return res.json({
            message: 'Login successful',
            token: token, // JWT Token to be used for authenticated requests
            user: user
        });
    }
}

export const authController = new AuthController();