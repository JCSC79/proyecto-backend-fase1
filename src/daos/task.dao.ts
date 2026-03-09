import knex from 'knex';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import config from '../../knexfile.cjs'; // Path config
import type { ITask } from '../models/task.model.ts';

// Initialize the database connection
const db = knex(config.development);

/**
 * Data Access Object.
 * Encapsulates all interactions with the PostgreSQL storage via Knex.
 */
class TaskDAO {
    
    // The in-memory array is removed. We now point to the 'tasks' table.

    async getAll(): Promise<ITask[]> {
        // SELECT * FROM tasks
        return await db<ITask>('tasks').select('*');
    }

    async getById(id: string): Promise<ITask | undefined> {
        // SELECT * FROM tasks WHERE id = id LIMIT 1
        // Knex uses parameterized queries here to prevent SQL Injection (OWASP)
        return await db<ITask>('tasks').where({ id }).first();
    }

    async create(task: ITask): Promise<ITask> {
        // INSERT INTO tasks (...) VALUES (...)
        await db<ITask>('tasks').insert(task);
        return task;
    }

    async update(id: string, updates: Partial<ITask>): Promise<ITask | undefined> {
        // UPDATE tasks SET ... WHERE id = id
        const updatedRows = await db<ITask>('tasks')
            .where({ id })
            .update(updates);

        if (updatedRows === 0) return undefined;
        return await this.getById(id);
    }

    async delete(id: string): Promise<boolean> {
        // DELETE FROM tasks WHERE id = id
        const deletedRows = await db<ITask>('tasks')
            .where({ id })
            .del();
            
        return deletedRows > 0;
    }
}

export const taskDAO = new TaskDAO();