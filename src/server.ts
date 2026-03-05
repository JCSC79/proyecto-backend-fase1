import express from 'express';
import type { Request, Response } from 'express';
/**
 * In Node 24, we explicitly use .ts extensions and 'import type' 
 * to handle TypeScript's native type stripping correctly.
 */
import { TaskStatus } from './models/task.model.ts';
import type { ITask } from './models/task.model.ts';

const app = express();
const PORT = 3000;

/**
 * Basic health check route
 * Provides a simple response to verify the server is online
 */
app.get('/', (req: Request, res: Response) => {
    res.send('Task Manager API: TypeScript is running perfectly!');
});

/**
 * Start the Express server
 */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

/**
 * Initial strict type verification
 * This object ensures our ITask interface and TaskStatus enum 
 * are correctly enforced by the compiler.
 */
const _testTask: ITask = {
    id: '1',
    title: 'Success',
    description: 'The server is finally up and running',
    status: TaskStatus.COMPLETED,
    createdAt: new Date()
};

console.log(`Status of test task: ${_testTask.status}`);