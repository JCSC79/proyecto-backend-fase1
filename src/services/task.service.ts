import { TaskStatus } from '../models/task.model.ts';
import type { ITask } from '../models/task.model.ts'; 
import { taskDAO } from '../daos/task.dao.ts';
import { messagingService } from './messaging.service.ts';
import { Result } from '../utils/result.ts';

/**
 * Orchestrates business logic and coordinates data access using the Result Pattern.
 * Ensures all operations return a standardized outcome to avoid exception-based flow control.
 */
export class TaskService {
    /**
     * Retrieves all tasks from the persistence layer.
     * @returns A Result containing an array of tasks.
     */
    async getAllTasks(): Promise<Result<ITask[]>> {
        const tasks = await taskDAO.getAll();
        return Result.ok(tasks);
    }

    /**
     * Finds a specific task by its unique identifier.
     * Returns a failure result if the task does not exist in the database.
     */
    async getTaskById(id: string): Promise<Result<ITask>> {
        const task = await taskDAO.getById(id);
        if (!task) {
            return Result.fail<ITask>("Task not found");
        }
        return Result.ok(task);
    }

    /**
     * Logic for generating new tasks, persisting them in PostgreSQL, 
     * and triggering asynchronous notifications via RabbitMQ.
     */
    async createTask(title: string, description: string): Promise<Result<ITask>> {
        const newTask: ITask = {
            id: crypto.randomUUID(),
            title,
            description,
            status: TaskStatus.PENDING,
            createdAt: new Date()
        };

        const createdTask = await taskDAO.create(newTask);

        // Notify via RabbitMQ message broker about the new task event
        await messagingService.sendTaskNotification(createdTask);

        return Result.ok(createdTask);
    }

    /**
     * Removes a task from the system.
     * Returns a failure result if the ID matches no existing record.
     */
    async deleteTask(id: string): Promise<Result<boolean>> {
        const success = await taskDAO.delete(id);
        if (!success) {
            return Result.fail<boolean>("Task not found");
        }
        return Result.ok(true);
    }

    /**
     * Delegates partial update operations to the storage layer.
     * Uses parameterized queries via Knex to maintain security against SQL Injection.
     */
    async updateTask(id: string, updates: Partial<ITask>): Promise<Result<ITask>> {
        const updatedTask = await taskDAO.update(id, updates);
        
        if (!updatedTask) {
            return Result.fail<ITask>("Task not found");
        }
        
        return Result.ok(updatedTask);
    }
}

export const taskService = new TaskService();