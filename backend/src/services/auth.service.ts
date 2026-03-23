import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDAO } from '../daos/user.dao.ts';
import { UserRole } from '../models/user.model.ts';
import type { IUser } from '../models/user.model.ts';
import { Result } from '../utils/result.ts';

// Environment variables for security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-2026';
const SALT_ROUNDS = 10; // Security standard for bcrypt work factor

/**
 * Service handling Authentication logic: Registration and Login.
 * Implements Hashing and JWT generation for Phase 4 Security.
 */
export class AuthService {
    
    /**
     * Registers a new user with password hashing.
     * Ensures email uniqueness before persistence.
     */
    async register(email: string, password: string): Promise<Result<IUser>> {
        // 1. Check for existing identity
        const existingUser = await userDAO.getByEmail(email);
        if (existingUser) {
            return Result.fail<IUser>("Email already registered");
        }

        // 2. Password Hashing (Phase 4 Security Requirement)
        // We never store the raw password, only the resulting hash
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser: IUser = {
            id: crypto.randomUUID(),
            email,
            password: hashedPassword,
            role: UserRole.USER,
            createdAt: new Date()
        };

        const createdUser = await userDAO.create(newUser);
        
        // 3. Security: Strip password from the object before returning to the controller
        const { password: _, ...userWithoutPassword } = createdUser;
        return Result.ok(userWithoutPassword as IUser);
    }

    /**
     * Validates user credentials and issues a session token.
     */
    async login(email: string, password: string): Promise<Result<string>> {
        const user = await userDAO.getByEmail(email);
        if (!user || !user.password) {
            return Result.fail<string>("Invalid credentials");
        }

        // 4. Secure Comparison (bcrypt.compare)
        // Protects against timing attacks and ensures hash integrity
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return Result.fail<string>("Invalid credentials");
        }

        // 5. JWT Generation (Stateless Session management)
        // Payload includes roles to support Frontend RBAC logic
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return Result.ok(token);
    }
}

export const authService = new AuthService();