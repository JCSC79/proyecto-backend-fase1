import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.ts';
import { TaskStatus } from '../models/task.model.ts';

/**
 * Handles incoming HTTP requests and formats outgoing responses.
 * Now supports asynchronous operations for database persistence.
 */
class TaskController {
    /**
     * Retrieves all tasks from PostgreSQL.
     */
    async getAll(req: Request, res: Response) {
        const tasks = await taskService.getAllTasks();
        res.json(tasks);
    }

    /**
     * Validates input and creates a new task in the database.
     */
    async create(req: Request, res: Response) {
        const { title, description } = req.body;
        
        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({ 
                message: 'Title and description are required and cannot be empty' });
        }

        const newTask = await taskService.createTask(title, description);
        res.status(201).json(newTask);
    }

    /**
     * Handles single task retrieval.
     */
    async getById(req: Request, res: Response) {
        const { id } = req.params;
        
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const task = await taskService.getTaskById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    }

    /**
     * Manages task deletion via DAO/Knex.
     */
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const deleted = await taskService.deleteTask(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    }

    /**
     * Updates an existing task partially in the DB.
     */
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const updates = req.body;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        if (updates.status && !Object.values(TaskStatus).includes(updates.status)) {
            return res.status(400).json({ 
                message: `Invalid status. Allowed values: ${Object.values(TaskStatus).join(', ')}` 
            });
        }

        const updatedTask = await taskService.updateTask(id, updates);
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updatedTask);
    }
}

export const taskController = new TaskController();