import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';
import type { ITask } from '../models/task.model.ts';

/**
 * Internal interface to help TypeScript understand Yup validation errors
 * without resorting to the forbidden 'any' type.
 */
interface YupValidationError extends Error {
    errors: string[];
}

/**
 * Handles incoming HTTP requests and formats outgoing responses.
 * Now supports asynchronous operations and strict schema validation.
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
     * Validates input using Yup and creates a new task in the database.
     */
    async create(req: Request, res: Response) {
        try {
            // Validation with Yup
            const validatedData = await createTaskSchema.validate(req.body, { abortEarly: false });

            const newTask = await taskService.createTask(validatedData.title, validatedData.description);
            res.status(201).json(newTask);

        } catch (error: unknown) {
            // Check if it is a Yup ValidationError using our safe interface
            if (error instanceof Error && error.name === 'ValidationError') {
                const yupError = error as YupValidationError;
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: yupError.errors
                });
            }

            // Generic server error
            res.status(500).json({ message: 'Internal server error' });
        }
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
     * Updates an existing task partially in the DB using Yup validation.
     */
    async update(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        try {
            // Validate and cast to Partial<ITask> using 'unknown' as a safe bridge
            const validatedUpdates = await updateTaskSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true 
            }) as unknown as Partial<ITask>;

            const updatedTask = await taskService.updateTask(id, validatedUpdates);

            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            res.json(updatedTask);

        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'ValidationError') {
                const yupError = error as YupValidationError;
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: yupError.errors
                });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export const taskController = new TaskController();