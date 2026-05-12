/**
 * Project Model - Defines the workspace structure.
 */
export interface IProject {
    id: string;         // UUID v4
    name: string;       // e.g., "General Project"
    userId: string;     // Owner of the project
    createdAt: Date;
}