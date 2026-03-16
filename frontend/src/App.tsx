import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './api/axiosInstance';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TaskFilters } from './components/tasks/TaskFilters';
import { TaskForm } from './components/tasks/TaskForm';
import { TaskItem } from './components/tasks/TaskItem';
import type { Task, TaskStatus } from './types/task';

/**
 * Main Application Component
 * Orchestrates data fetching, global filtering, and the Kanban board layout
 */
const App: React.FC = () => {
  // Global filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

  // Fetch tasks from PostgreSQL via Backend API
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data;
    },
  });

  // Client-side filtering logic for search and status bar
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  /**
   * Helper function to render a Kanban column
   * Filters the already filtered list by the specific column status
   */
  const renderColumn = (label: string, status: TaskStatus) => {
    const columnTasks = filteredTasks.filter(task => task.status === status);
    
    return (
      <div style={{ 
        flex: 1, 
        minWidth: '300px', 
        backgroundColor: '#ebf1f5', 
        padding: '15px', 
        borderRadius: '8px',
        minHeight: '400px'
      }}>
        <h3 style={{ 
          borderBottom: '2px solid #5c7080', 
          paddingBottom: '10px', 
          marginBottom: '15px',
          color: '#182026',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          {label} 
          <span style={{ fontSize: '0.8em', color: '#5c7080' }}>({columnTasks.length})</span>
        </h3>
        
        <div>
          {columnTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {columnTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: '#a7b6c2', marginTop: '20px', fontStyle: 'italic' }}>
              No tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f5f8fa', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ marginTop: '20px' }}>
          <TaskFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          <TaskForm />
        </div>

        {isLoading && <div style={{ textAlign: 'center', marginTop: '50px' }}>Synchronizing with DB...</div>}

        {/* Kanban Board Layout */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginTop: '30px',
          alignItems: 'flex-start',
          overflowX: 'auto', // Support for smaller screens
          paddingBottom: '20px'
        }}>
          {/* We only show columns that match the current status filter */}
          {(statusFilter === 'ALL' || statusFilter === 'PENDING') && renderColumn('PENDING', 'PENDING')}
          {(statusFilter === 'ALL' || statusFilter === 'IN_PROGRESS') && renderColumn('IN PROGRESS', 'IN_PROGRESS')}
          {(statusFilter === 'ALL' || statusFilter === 'COMPLETED') && renderColumn('COMPLETED', 'COMPLETED')}
        </div>

        {filteredTasks.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: '#5c7080', marginTop: '50px' }}>
            No tasks match your search criteria.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;