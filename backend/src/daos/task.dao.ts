import knex from 'knex';
import { createRequire } from 'module';
import type { ITask } from '../models/task.model.ts';

const require = createRequire(import.meta.url);
const config = require('../../knexfile.cjs');
const db = knex(config.development);

/**
 * TaskDAO - Data Access Object for tasks.
 *
 * Visibility model (Odoo-inspired):
 *   A user can READ a task if:
 *     a) they created it (tasks.userId = me), OR
 *     b) the task belongs to a project they are a member of
 *        (tasks.projectId IN project_members WHERE userId = me)
 *
 *   WRITE operations (update, delete) remain restricted to the creator
 *   to avoid accidental data loss by non-owning project members.
 */
class TaskDAO {

    /**
     * Returns all tasks visible to the user:
     *   - tasks the user created (any project or no project), PLUS
     *   - tasks in projects the user is a member of (created by others).
     */
    async getAll(userId: string): Promise<ITask[]> {
        return await db<ITask>('tasks')
            .where({ userId })
            .orWhere(function () {
                // Include tasks from projects where the user is a member
                this.whereNotNull('projectId').whereIn(
                    'projectId',
                    db('project_members').select('projectId').where({ userId })
                );
            })
            .select('*');
    }

    /**
     * SPECIAL: Allows ADMIN role to see the entire global task board.
     */
    async adminGetAll(): Promise<ITask[]> {
        return await db<ITask>('tasks').select('*');
    }

    /**
     * Finds a task by ID using the same visibility rule as getAll:
     * the user must be either the creator OR a member of the task's project.
     */
    async getById(id: string, userId: string): Promise<ITask | undefined> {
        return await db<ITask>('tasks')
            .where({ id, userId })
            .orWhere(function () {
                this.where('id', id)
                    .whereNotNull('projectId')
                    .whereIn(
                        'projectId',
                        db('project_members').select('projectId').where({ userId })
                    );
            })
            .first();
    }

    async create(task: ITask): Promise<ITask> {
        await db<ITask>('tasks').insert(task);
        return task;
    }

    /**
     * Updates a task only if the ownership (userId) matches.
     */
    async update(id: string, userId: string, updates: Partial<ITask>): Promise<ITask | undefined> {
        const updatedRows = await db<ITask>('tasks')
            .where({ id, userId })
            .update(updates);

        if (updatedRows === 0) {
            return undefined;
        }
        return await this.getById(id, userId);
    }

    /**
     * Deletes a record strictly filtered by ID and Owner.
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const deletedRows = await db<ITask>('tasks')
            .where({ id, userId })
            .del();
            
        return deletedRows > 0;
    }

    /**
     * Bulk delete limited to the user's own tasks.
     */
    async deleteAll(userId: string): Promise<void> {
        await db('tasks').where({ userId }).del();
    }

    /**
     * Bulk delete filtered by status for a specific user.
     */
    async deleteByStatus(userId: string, status: string): Promise<number> {
        return await db('tasks').where({ userId, status }).del();
    }
}

export const taskDAO = new TaskDAO();