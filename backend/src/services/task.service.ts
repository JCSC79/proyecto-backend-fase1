import { TaskStatus } from '../models/task.model.ts';
import type { ITask } from '../models/task.model.ts'; 
import { taskDAO } from '../daos/task.dao.ts';
import { messagingService } from './messaging.service.ts';
import { Result } from '../utils/result.ts';

/**
 * Orchestrates business logic and coordinates data access using the Result Pattern.
 */
export class TaskService {
    // Explicitly declaring properties to avoid "Parameter Properties" syntax errors in Node v24
    private readonly dao: typeof taskDAO;
    private readonly messaging: typeof messagingService;
    
    /**
     * Phase 3: Dependency Injection via constructor.
     * Standard syntax used to ensure compatibility with Node's native TS support.
     */
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

    async createTask(title: string, description: string): Promise<Result<ITask>> {
        // Business Rule validation for Phase 3 Testing Evidence
        if (!title || title.trim() === '') {
            return Result.fail<ITask>("Title is required");
        }

        const newTask: ITask = {
            id: crypto.randomUUID(),
            title,
            description,
            status: TaskStatus.PENDING,
            createdAt: new Date()
        };

        const createdTask = await this.dao.create(newTask);
        
        try {
            // Using the injected messaging service
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

    /**
     * NEW: Business logic to clear all tasks from the persistence layer.
     * Part of Phase 1: Support for mass deletion requests.
     */
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
            return Result.fail<ITask>("Task not found or update failed");
        }
        return Result.ok(updatedTask);
    }
}

// Default instance using real infrastructure
export const taskService = new TaskService();