import { TaskStatus } from '../models/task.model.ts';
import type { ITask } from '../models/task.model.ts'; 
import { taskDAO } from '../daos/task.dao.ts';
import { messagingService } from './messaging.service.ts';
import { Result } from '../utils/result.ts';

/**
 * Orchestrates business logic and coordinates data access using the Result Pattern.
 */
export class TaskService {
    async getAllTasks(): Promise<Result<ITask[]>> {
        const tasks = await taskDAO.getAll();
        return Result.ok(tasks);
    }

    async getTaskById(id: string): Promise<Result<ITask>> {
        const task = await taskDAO.getById(id);
        if (!task) return Result.fail<ITask>("Task not found");
        return Result.ok(task);
    }

    async createTask(title: string, description: string): Promise<Result<ITask>> {
        const newTask: ITask = {
            id: crypto.randomUUID(),
            title,
            description,
            status: TaskStatus.PENDING,
            createdAt: new Date()
        };
        const createdTask = await taskDAO.create(newTask);
        try {
            await messagingService.sendTaskNotification(createdTask);
        } catch (error) {
            console.error("[TaskService] Messaging notification failed:", error);
        }
        return Result.ok(createdTask);
    }

    async deleteTask(id: string): Promise<Result<boolean>> {
        const success = await taskDAO.delete(id);
        if (!success) return Result.fail<boolean>("Task not found");
        return Result.ok(true);
    }

    /**
     * NEW: Business logic to clear all tasks from the persistence layer.
     * Part of Phase 1: Support for mass deletion requests.
     */
    async deleteAllTasks(): Promise<Result<boolean>> {
        await taskDAO.deleteAll();
        return Result.ok(true);
    }

    async updateTask(id: string, updates: Partial<ITask>): Promise<Result<ITask>> {
        const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date()
        };
        const updatedTask = await taskDAO.update(id, updatesWithTimestamp);
        if (!updatedTask) return Result.fail<ITask>("Task not found or update failed");
        return Result.ok(updatedTask);
    }
}

export const taskService = new TaskService();