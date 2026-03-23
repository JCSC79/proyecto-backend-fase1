import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';
import { taskController } from './controllers/task.controller.ts';
import { authController } from './controllers/auth.controller.ts'; // NEW: Auth Controller
import { messagingService } from './services/messaging.service.ts';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${req.method} ${req.url}`);
    next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * AUTHENTICATION ROUTES (Phase 4)
 * Public endpoints for user identity management.
 */
app.post('/auth/register', (req, res) => authController.register(req, res));
app.post('/auth/login', (req, res) => authController.login(req, res));

/**
 * TASK ROUTES
 * IMPORTANT: Static routes like DELETE /tasks must be defined BEFORE 
 * parameterized routes like DELETE /tasks/:id to avoid matching conflicts.
 */
app.get('/tasks', (req, res) => taskController.getAll(req, res));
app.post('/tasks', (req, res) => taskController.create(req, res));
app.delete('/tasks', (req, res) => taskController.deleteAll(req, res));

app.get('/tasks/:id', (req, res) => taskController.getById(req, res));
app.delete('/tasks/:id', (req, res) => taskController.delete(req, res));
app.patch('/tasks/:id', (req, res) => taskController.update(req, res));

/**
 * Start the Express server and initialize dependencies.
 */
app.listen(PORT, async () => {
    await messagingService.init();
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    console.log('Endpoints ready: AUTH (Register/Login), TASKS (CRUD)');
});