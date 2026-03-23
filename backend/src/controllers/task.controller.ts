import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';
import type { ITask } from '../models/task.model.ts';

/**
 * Interface for Yup validation errors to avoid 'any'.
 */
interface YupError {
  message: string;
}

/**
 * Handles incoming HTTP requests and orchestrates the service layer.
 * Implements the Result Pattern for consistent error handling.
 */
class TaskController {
  /**
   * Retrieves all tasks from the database.
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    const result = await taskService.getAllTasks();
    res.json(result.getValue());
  }

  /**
   * Handles single task retrieval by UUID.
   */
  async getById(req: Request, res: Response): Promise<Response | void> {
    const { id } = req.params;
    
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
   * Validates input using Yup schemas and creates a new task.
   * Phase 4: Now extracts the userId from the authenticated request.
   */
  async create(req: Request, res: Response): Promise<Response | void> {
    try {
      // 1. Validate input data
      const validatedData = await createTaskSchema.validate(req.body, { abortEarly: false });
      
      // 2. Extract userId injected by the 'authenticate' middleware
      const userId = (req as Request & { user: { id: string } }).user.id;
      
      // 3. Pass both task data and owner ID to the service
      const result = await taskService.createTask(
        validatedData.title, 
        validatedData.description || '',
        userId
      );
      
      if (result.isFailure) {
        return res.status(500).json({ error: result.error });
      }

      res.status(201).json(result.getValue());
    } catch (err) {
      const yupError = err as YupError;
      return res.status(400).json({ error: yupError.message });
    }
  }

  /**
   * Manages task deletion. 
   */
  async delete(req: Request, res: Response): Promise<Response | void> {
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
   * Controller action to handle mass deletion request (Clear Board).
   */
  async deleteAll(_req: Request, res: Response): Promise<Response | void> {
    const result = await taskService.deleteAllTasks();
    if (result.isFailure) {
      return res.status(500).json({ error: result.error });
    }
    res.status(204).send();
  }

  /**
   * Updates an existing task partially.
   */
  async update(req: Request, res: Response): Promise<Response | void> {
    const { id } = req.params;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      const validatedUpdates = await updateTaskSchema.validate(req.body, { 
        stripUnknown: true 
      });

      const result = await taskService.updateTask(id, validatedUpdates as Partial<ITask>);
      
      if (result.isFailure) {
        const status = result.error?.includes('not found') ? 404 : 500;
        return res.status(status).json({ error: result.error });
      }

      res.json(result.getValue());
    } catch (err) {
      const yupError = err as YupError;
      return res.status(400).json({ error: yupError.message });
    }
  }
}

export const taskController = new TaskController();