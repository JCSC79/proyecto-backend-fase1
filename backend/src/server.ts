import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';
import { taskController } from './controllers/task.controller.ts';
import { messagingService } from './services/messaging.service.ts';
import authRoutes from './routes/auth.routes.ts';
import { authenticateToken } from './middlewares/auth.middleware.ts'; // NEW: Security Middleware

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
 * ROUTES MAPPING
 */

// 1. PUBLIC ROUTES (No token required)
app.use('/api/auth', authRoutes);

// 2. PROTECTED ROUTES (Token required for all /tasks endpoints)
// This acts as a global guard for the task domain
app.use('/tasks', authenticateToken); 

app.get('/tasks', (req, res) => taskController.getAll(req, res));
app.post('/tasks', (req, res) => taskController.create(req, res));

// Bulk operations (Defined before parameterized routes)
app.delete('/tasks', (req, res) => taskController.deleteAll(req, res));

app.get('/tasks/:id', (req, res) => taskController.getById(req, res));
app.delete('/tasks/:id', (req, res) => taskController.delete(req, res));
app.patch('/tasks/:id', (req, res) => taskController.update(req, res));

/**
 * SERVER STARTUP
 */
app.listen(PORT, async () => {
    await messagingService.init();
    console.log(`[OK] Server running at http://localhost:${PORT}`);
    console.log(`[SECURE] Tasks routes are now protected by JWT middleware`);
    console.log(`[DOCS] Swagger available at http://localhost:${PORT}/api-docs`);
});