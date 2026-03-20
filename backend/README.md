# Task Manager Backend

This project is a high-performance **Distributed API** focused on **Separation of Concerns (SoC)**, **SOLID principles**, and **Asynchronous Messaging**. Built with **Node.js (v24)**, **Express**, and **RabbitMQ** using a strict **Zero-Any TypeScript** policy.

## New in Phase 3: Mass Operations & Stress Testing

- **Bulk Clear Board:** New `DELETE /tasks` endpoint for instant system-wide cleanup.
- **Enhanced Validation:** Strict **Yup** schemas for task creation and multi-field updates (Title, Description, Status).
- **Stress Testing Engine:** Integrated seeder capable of planting **500+ tasks** with unique UUIDs and realistic timeframes to validate UI stability.
- **Automated CLI:** Simplified database management via new `npm run` shortcuts in `package.json`.

## Architecture Overview

- **Controller Layer (`src/controllers/`):** Standardized API responses using the **Result Pattern**.
- **Service Layer (`src/services/`):** Orchestrates business logic and triggers RabbitMQ events.
- **Messaging Service (`src/services/messaging.service.ts`):** Encapsulates RabbitMQ producer logic.
- **DAO Layer (`src/daos/`):** Abstraction for PostgreSQL persistence via Knex.js.
- **Worker (`src/worker.ts`):** Independent consumer for processing asynchronous task notifications.

## API Capabilities (CRUD)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks. |
| **POST** | `/tasks` | Create task with strict Title/Desc validation. |
| **DELETE** | `/tasks` | **(New)** Clear the entire board. |
| **PATCH** | `/tasks/:id` | Update title, description, or status. |
| **DELETE** | `/tasks/:id` | Remove a specific task. |

## Database & Infrastructure

- **Stack:** PostgreSQL 15+ & RabbitMQ (via Docker).
- **Security:** Parameterized queries (OWASP Option 1) to prevent SQL Injection.
- **Automation Scripts:**
  - `npm run db:migrate`: Setup/Update database schema.
  - `npm run db:seed`: **(New)** Plant massive test data (500 tasks) for dashboard validation.
  - `npm run db:rollback`: Revert last database changes.

## Interactive Documentation (Swagger)

The API includes an interactive **OpenAPI 3.0** explorer available at:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Running the Application

1. **Infrastructure:** `docker compose up -d`.
2. **Setup:** `npm install` && `npm run db:migrate`.
3. **API Server:** `npm run dev`.
4. **Worker:** `npx tsx src/worker.ts`.

---
*Developed as part of the Backend Intensive Training (2026).*
