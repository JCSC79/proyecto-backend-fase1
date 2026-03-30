import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';
import type { ITask } from '../models/task.model.ts';

/**
 * Custom interface to extend Express Request.
 * This allows us to access 'req.user' without using 'any'.
 */
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

interface YupError {
  message: string;
}

class TaskController {
  async getAll(_req: Request, res: Response): Promise<void> {
    const result = await taskService.getAllTasks();
    res.json(result.getValue());
  }

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
   * Validates input and creates a new task with the owner's ID.
   */
  async create(req: Request, res: Response): Promise<Response | void> {
    try {
      const validatedData = await createTaskSchema.validate(req.body, { abortEarly: false });
      
      /**
       * CLEAN TYPING: We cast 'req' to our 'AuthRequest' interface.
       * This fulfills ESLint rules and ensures 'id' exists.
       */
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User identity not found in token" });
      }

      const result = await taskService.createTask(
        validatedData.title, 
        validatedData.description,
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

  async deleteAll(_req: Request, res: Response): Promise<Response | void> {
    const result = await taskService.deleteAllTasks();
    if (result.isFailure) {
      return res.status(500).json({ error: result.error });
    }
    res.status(204).send();
  }

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