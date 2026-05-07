import knex from 'knex';
import { createRequire } from 'module';
import type { IProject } from '../models/project.model.ts';

const require = createRequire(import.meta.url);
const config = require('../../knexfile.cjs');
const db = knex(config.development);

/**
 * ProjectDAO - Handles database interactions for the Project entity.
 */
class ProjectDAO {
    /**
     * Retrieves all projects belonging to a specific user.
     */
    async getAllByUser(userId: string): Promise<IProject[]> {
        return await db<IProject>('projects').where({ userId }).select('*');
    }

    /**
     * Gets a specific project ensuring user ownership.
     */
    async getById(id: string, userId: string): Promise<IProject | undefined> {
        return await db<IProject>('projects').where({ id, userId }).first();
    }

    /**
     * Creates a new project workspace.
     */
    async create(project: IProject): Promise<IProject> {
        await db<IProject>('projects').insert(project);
        return project;
    }

    /**
     * Deletes a project and its tasks (due to Cascade Delete in DB).
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const deletedRows = await db<IProject>('projects')
            .where({ id, userId })
            .del();
        return deletedRows > 0;
    }
}

export const projectDAO = new ProjectDAO();