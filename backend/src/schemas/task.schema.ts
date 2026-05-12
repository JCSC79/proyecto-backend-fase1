import * as yup from 'yup';
import { TaskStatus } from '../models/task.model.ts';

/**
 * Validation schema for task creation.
 * Added projectId validation to support new database structure.
 */
export const createTaskSchema = yup.object({
    title: yup.string()
        .required('err_title_required')
        .min(3, 'err_title_short')
        .max(50, 'err_title_long'),
    description: yup.string()
        .required('err_desc_required')
        .min(10, 'err_desc_short'),
    projectId: yup.string().uuid().optional() // Validate as UUID if provided
});

/**
 * Validation schema for task updates.
 * We apply the same translation keys to maintain consistency.
 */
export const updateTaskSchema = yup.object({
    title: yup.string()
        .min(3, 'err_title_short')
        .max(50, 'err_title_long'),
    description: yup.string()
        .min(10, 'err_desc_short'),
    status: yup.mixed<TaskStatus>()
        .oneOf(Object.values(TaskStatus), 'err_status_invalid'),
    projectId: yup.string().uuid().optional()
});