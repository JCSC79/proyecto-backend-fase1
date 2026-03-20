# Task Manager Frontend

Professional task management interface built with **React 19**, **Vite**, and **BlueprintJS**. Optimized for high-density data visualization.

## Key Features

### KPI Dashboard & Analytics

- **Real-time Metrics:** Calculation of Board Health, Task Completion Rates, and System Activity.
- **Performance Tracking:** Automatic measurement of "Average Completion Time" based on historical data.
- **Visual Charts:** Interactive Pie, Bar, and Line charts powered by **Recharts**.

### Smart Pagination Engine

- **Independent Column Scrolling:** Each status column (Pending, In Progress, Completed) maintains its own pagination state.
- **Scalability:** Successfully tested with **500+ tasks** (34+ pages per column) without performance degradation.
- **Optimistic Updates:** Server-state synchronization handled by **TanStack Query** for smooth transitions.

### Internationalization (i18n)

- **Full Localization:** Complete support for English and Spanish.
- **Dynamic Switching:** Real-time language toggling across the entire UI.

### UI/UX Patterns

- **Global Notifications:** Centralized `AppToaster` system for real-time feedback on API operations (Success/Error/Validation).
- **Theme Engine:** Full support for Dark and Light modes using BlueprintJS core tokens.
- **Zero Any Policy:** Strictly typed components and interfaces to ensure maximum stability.

## Development Setup

### 1. Install Dependencies

```npm install --legacy-peer-deps```
Note: Using --legacy-peer-deps is required for React 19 compatibility with some BlueprintJS dependencies.

### 2. Run the Application

```npm run dev```
The application will be available at: <http://localhost:5173>

## Project Structure

- /src/components: UI building blocks (Forms, Board, Filters).
- /src/views: Main layouts (Dashboard, Board View).
- /src/i18n: Localization dictionaries and configuration.
- /src/hooks: Custom React hooks for data fetching and state logic.

---
*Developed as part of the Full-Stack Intensive Training - 2026.*
