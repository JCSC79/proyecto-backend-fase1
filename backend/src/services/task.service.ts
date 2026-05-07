import { TaskStatus } from '../models/task.model.ts';
import type { ITask } from '../models/task.model.ts'; 
import { taskDAO } from '../daos/task.dao.ts';
import { messagingService } from './messaging.service.ts';
import { Result } from '../utils/result.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';
import crypto from 'node:crypto';

/**
 * TaskService - Orchestrates business logic with strict user isolation.
 * Validation and messaging are now handled here to keep controllers lean.
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

    async getAllTasks(user: { id: string, role: string }): Promise<Result<ITask[]>> {
        const tasks = await this.dao.getAll(user.id);
        return Result.ok(tasks);
    }

    async getTaskById(id: string, userId: string): Promise<Result<ITask>> {
        const task = await this.dao.getById(id, userId);
        if (!task) {
            return Result.fail<ITask>("Task not found or access denied");
        }
        return Result.ok(task);
    }

    async createTask(data: unknown, userId: string): Promise<Result<ITask>> {
        try {
            const validated = await createTaskSchema.validate(data, { abortEarly: false });
            
            const newTask: ITask = {
                id: crypto.randomUUID(),
                title: validated.title,
                description: validated.description,
                status: TaskStatus.PENDING,
                userId,
                createdAt: new Date()
            };

            const createdTask = await this.dao.create(newTask);
            await this.messaging.sendTaskNotification(createdTask);
            return Result.ok(createdTask);
        } catch (err: unknown) {
            const error = err as { errors?: string[]; message: string };
            return Result.fail<ITask>(error.errors?.join(', ') || error.message);
        }
    }

    async deleteTask(id: string, userId: string): Promise<Result<void>> {
        const success = await this.dao.delete(id, userId);
        if (!success) {
            return Result.fail<void>("Task not found or permission denied");
        }
        return Result.ok(undefined);
    }

    async deleteTasksByStatus(userId: string, status?: string): Promise<Result<void>> {
        if (status) {
            await this.dao.deleteByStatus(userId, status);
        } else {
            await this.dao.deleteAll(userId);
        }
        return Result.ok(undefined);
    }

    /**
     * Validates updates and persists them if the user owns the task.
     */
    async updateTask(id: string, userId: string, data: unknown): Promise<Result<ITask>> {
        try {
            const validated = await updateTaskSchema.validate(data, { 
                stripUnknown: true, 
                abortEarly: false 
            });
            
            // FIX: Explicitly cast to Partial<ITask> to satisfy DAO requirements
            const updates: Partial<ITask> = { 
                ...(validated as Partial<ITask>), 
                updatedAt: new Date() 
            };
            
            const updatedTask = await this.dao.update(id, userId, updates);

            if (!updatedTask) {
                return Result.fail<ITask>("Unauthorized update attempt or task not found");
            }
            return Result.ok(updatedTask);
        } catch (err: unknown) {
            const error = err as { errors?: string[]; message: string };
            return Result.fail<ITask>(error.errors?.join(', ') || error.message);
        }
    }
}

export const taskService = new TaskService();