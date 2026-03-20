import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Swagger Configuration
 * Carefully updated to include Phase 3 bulk operations and extended update fields.
 * Validated against OpenAPI 3.0.0 standards.
 */
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'Distributed task management API with RabbitMQ and PostgreSQL',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development Server' }],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    },
    paths: {
      '/tasks': {
        get: {
          summary: 'Retrieve all tasks',
          tags: ['Tasks'],
          responses: {
            200: {
              description: 'Success',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } }
            }
          }
        },
        post: {
          summary: 'Create a new task',
          tags: ['Tasks'],
          requestBody: {
            required: true,
            content: { 
              'application/json': { 
                schema: { 
                  type: 'object', 
                  required: ['title', 'description'], // Reflects strict requirements
                  properties: { 
                    title: { type: 'string' }, 
                    description: { type: 'string' } 
                  } 
                } 
              } 
            }
          },
          responses: {
            201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            400: { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        // NEW: Mass deletion endpoint documentation
        delete: {
          summary: 'Delete all tasks (Clear Board)',
          tags: ['Tasks'],
          responses: {
            204: { description: 'All tasks successfully deleted' },
            500: { description: 'Internal Server Error' }
          }
        }
      },
      '/tasks/{id}': {
        get: {
          summary: 'Get task by ID',
          tags: ['Tasks'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        patch: {
          summary: 'Update task details or status', // Updated summary
          tags: ['Tasks'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 
              'application/json': { 
                schema: { 
                  type: 'object', 
                  properties: { 
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] } 
                  } 
                } 
              } 
            }
          },
          responses: {
            200: { description: 'Updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            404: { description: 'Task not found' }
          }
        },
        delete: {
          summary: 'Delete a specific task',
          tags: ['Tasks'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 
            204: { description: 'Deleted' }, 
            404: { description: 'Not found' } 
          }
        }
      }
    }
  },
  apis: [], 
};

export const swaggerSpec = swaggerJSDoc(options);