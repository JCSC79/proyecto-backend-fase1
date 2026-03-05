/**
 * Task status options
 * Using an enum ensures type safety for task states
 */
export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

/**
 * Main Task Interface
 * Defines the strict structure that every task must follow
 */
export interface ITask {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
}