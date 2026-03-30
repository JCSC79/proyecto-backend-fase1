import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDAO } from '../daos/user.dao.ts';
import { Result } from '../utils/result.ts';
import type { IUser } from '../models/user.model.ts';

// Secret key from .env to sign the tokens
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * AuthService - Handles the business logic for authentication and JWT generation.
 */
class AuthService {
    /**
     * Validates user credentials and generates a secure JWT Token.
     * @returns A Result object containing the user (without password) and the token.
     */
    async validateUser(email: string, password: string): Promise<Result<{ user: Omit<IUser, 'password'>, token: string }>> {
        const user = await userDAO.getByEmail(email);

        if (!user) {
            return Result.fail('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return Result.fail('Invalid credentials');
        }

        // Generate the Token (Payload contains ID, Email and Role)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' } // Token expires in one day
        );

        // Security: Remove password before returning user data
        const { password: _, ...userWithoutPassword } = user;
        
        return Result.ok({
            user: userWithoutPassword,
            token: token
        });
    }
}

export const authService = new AuthService();