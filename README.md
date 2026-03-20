# Full-Stack Task Manager - Distributed Architecture

This repository contains a complete Task Management system with a **Node.js/Express Backend** and a **React Frontend**. Optimized for handling 500+ tasks with distributed architecture and real-time metrics.

## Project Structure

- **`/backend`**: Node.js v24 API. Uses PostgreSQL, RabbitMQ, and the Result Pattern.
- **`/frontend`**: React 19 application using Vite, BlueprintJS, and TanStack Query.
- **`docker-compose.yml`**: Infrastructure (PostgreSQL 15 & RabbitMQ) shared by the entire project.

---

## Quick Start (How to run)

### 1. Infrastructure (Docker)

From the **root** folder, spin up the database and the message broker:
```docker compose up -d```

### 2. Backend Setup

```cd backend```
```npm install```
```npm run db:migrate```   # Setup database schema
```npm run db:seed```      # NEW: Plant 350-500 test tasks
```npm run dev```          # Start the API at <http://localhost:3000>

Note: To process background notifications, run the worker in a separate terminal:

```npx tsx src/worker.ts```

### 3. Frontend Setup

```cd frontend```
```npm install --legacy-peer-deps```
```npm run dev```          # Start the UI at <http://localhost:5173>

## API Documentation

Interactive Swagger UI explorer available at: <http://localhost:3000/api-docs>

## Tech Stack Summary

- **Backend:** Node.js (v24), Express, TypeScript, Knex.js, RabbitMQ.
- **Frontend:** React 19, Vite, BlueprintJS, Axios, TanStack Query.
- **Database:** PostgreSQL.
- **DevOps:** Docker & Docker Compose.

---
*Developed as part of the Backend Intensive Training - 2026.*
