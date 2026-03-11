import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';
import type { ITask } from '../models/task.model.ts';

/**
 * Handles incoming HTTP requests and orchestrates the service layer.
 * Implements the Result Pattern for consistent error handling and response formatting.
 */
class TaskController {
    /**
     * Retrieves all tasks from the database.
     * Uses the Result pattern to encapsulate the task collection.
     */
    async getAll(_req: Request, res: Response) {
        const result = await taskService.getAllTasks();
        // Since getAll unlikely fails at service level, we directly return the value
        res.json(result.getValue());
    }

    /**
     * Handles single task retrieval by UUID.
     * Checks for result failure to return appropriate 404 responses.
     */
    async getById(req: Request, res: Response) {
        const { id } = req.params;

        // Type guard to ensure ID is a string and prevent 'undefined' issues
        if (typeof id !== 'string') {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await taskService.getTaskById(id);
        
        if (result.isFailure) {
            return res.status(404).json({ error: result.error });
        }

        res.json(result.getValue());
    }

    /**
     * Validates input using Yup and creates a new task.
     * Triggers asynchronous messaging via service layer on success.
     */
    async create(req: Request, res: Response) {
        try {
            // Schema validation based on createTaskSchema
            const validatedData = await createTaskSchema.validate(req.body);
            
            const result = await taskService.createTask(validatedData.title, validatedData.description);
            
            res.status(201).json(result.getValue());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({ error: message });
        }
    }

    /**
     * Manages task deletion. 
     * Returns 204 No Content on success or 404 if the task doesn't exist.
     */
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await taskService.deleteTask(id);
        
        if (result.isFailure) {
            return res.status(404).json({ error: result.error });
        }

        res.status(204).send();
    }

    /**
     * Updates an existing task partially.
     * Uses safe casting and schema stripping to ensure data integrity.
     */
    async update(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        try {
            // Validating and stripping unknown fields for security
            const validatedUpdates = await updateTaskSchema.validate(req.body, { 
                stripUnknown: true 
            }) as Partial<ITask>;

            const result = await taskService.updateTask(id, validatedUpdates);
            
            if (result.isFailure) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result.getValue());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({ error: message });
        }
    }
}

export const taskController = new TaskController();