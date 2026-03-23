import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.ts';

/**
 * Controller to handle Authentication HTTP requests.
 * Connects the API endpoints with the AuthService logic.
 */
class AuthController {

    /**
     * Handles user registration.
     * Expected body: { email, password }
     */
    async register(req: Request, res: Response): Promise<Response | void> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await authService.register(email, password);

        if (result.isFailure) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.getValue());
    }

    /**
     * Handles user login and returns a JWT token.
     * Expected body: { email, password }
     */
    async login(req: Request, res: Response): Promise<Response | void> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await authService.login(email, password);

        if (result.isFailure) {
            // We return 401 Unauthorized for login failures
            return res.status(401).json({ error: result.error });
        }

        return res.json({ token: result.getValue() });
    }
}

export const authController = new AuthController();