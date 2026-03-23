/**
 * User roles for Role-Based Access Control (RBAC).
 * Using 'as const' ensures compatibility with our Node v24 strict mode.
 */
export const UserRole = {
    ADMIN: 'ADMIN',
    USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Main User Interface.
 * Note: password is optional here because we often exclude it from API responses.
 */
export interface IUser {
    id: string;
    email: string;
    password?: string; 
    role: UserRole;
    createdAt: Date;
}