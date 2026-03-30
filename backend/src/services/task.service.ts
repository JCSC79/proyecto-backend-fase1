import { TaskStatus } from '../models/task.model.ts';
import type { ITask } from '../models/task.model.ts'; 
import { taskDAO } from '../daos/task.dao.ts';
import { messagingService } from './messaging.service.ts';
import { Result } from '../utils/result.ts';
import crypto from 'node:crypto'; // Standard crypto module for Node v24

/**
 * TaskService - Handles business logic for task management.
 * Coordinates between the database (DAO) and notification services.
 */
export class TaskService {
    private readonly dao: typeof taskDAO;
    private readonly messaging: typeof messagingService;
    
    constructor(
        dao: typeof taskDAO = taskDAO,
        messaging: typeof messagingService = messagingService
    ) {
        this.dao = dao;
        this.messaging = messaging;
    }

    async getAllTasks(): Promise<Result<ITask[]>> {
        const tasks = await this.dao.getAll();
        return Result.ok(tasks);
    }

    async getTaskById(id: string): Promise<Result<ITask>> {
        const task = await this.dao.getById(id);
        if (!task) {
            return Result.fail<ITask>("Task not found");
        }
        return Result.ok(task);
    }

    /**
     * Creates a new task assigned to a specific user.
     * Required by DB foreign key constraints.
     */
    async createTask(title: string, description: string, userId: string): Promise<Result<ITask>> {
        if (!title || title.trim() === '') {
            return Result.fail<ITask>("Title is required");
        }

        // Creating the task object with full type safety
        const newTask: ITask = {
            id: crypto.randomUUID(),
            title,
            description,
            status: TaskStatus.PENDING,
            userId, // Link task to its owner
            createdAt: new Date()
        };

        const createdTask = await this.dao.create(newTask);
        
        try {
            await this.messaging.sendTaskNotification(createdTask);
        } catch (error) {
            console.error("[TaskService] Messaging notification failed:", error);
        }
        
        return Result.ok(createdTask);
    }

    async deleteTask(id: string): Promise<Result<boolean>> {
        const success = await this.dao.delete(id);
        if (!success) {
            return Result.fail<boolean>("Task not found");
        }
        return Result.ok(true);
    }

    async deleteAllTasks(): Promise<Result<boolean>> {
        await this.dao.deleteAll();
        return Result.ok(true);
    }

    async updateTask(id: string, updates: Partial<ITask>): Promise<Result<ITask>> {
        const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date()
        };
        const updatedTask = await this.dao.update(id, updatesWithTimestamp);
        if (!updatedTask) {
            return Result.fail<ITask>("Task not found");
        }
        return Result.ok(updatedTask);
    }
}

export const taskService = new TaskService();