import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './api/axiosInstance';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TaskFilters } from './components/tasks/TaskFilters';
import { TaskForm } from './components/tasks/TaskForm';
import { TaskBoard } from './components/tasks/TaskBoard';
import type { Task, TaskStatus } from './types/task';
import { useTranslation } from 'react-i18next';

/**
 * Main Application Component
 * Updated: Re-added the global wrapper class to ensure Blueprint components inherit the dark theme.
 */
const App: React.FC = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isDark, setIsDark] = useState(false);

  // Global dark mode effect for body background and modals
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('bp4-dark');
      document.body.style.backgroundColor = '#202b33'; 
    } else {
      document.body.classList.remove('bp4-dark');
      document.body.style.backgroundColor = '#f5f8fa'; 
    }
  }, [isDark]);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data;
    },
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const total = tasks?.length || 0;
  const completed = tasks?.filter(t => t.status === 'COMPLETED').length || 0;
  const progressValue = total > 0 ? completed / total : 0;

  return (
    // Re-added className={isDark ? "bp4-dark" : ""} to force inheritance
    <div className={isDark ? "bp4-dark" : ""} style={{ minHeight: '100vh', color: isDark ? '#f5f8fa' : '#182026' }}>
      <Header progress={progressValue} isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
      
      <main style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ marginTop: '20px' }}>
          <TaskFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          {/* Passed isDark to TaskForm to ensure its background changes */}
          <TaskForm isDark={isDark} />
        </div>

        {isLoading && <div style={{ textAlign: 'center', marginTop: '50px', color: isDark ? '#a7b6c2' : 'inherit' }}>{t('syncing')}</div>}

        {!isLoading && (
          <TaskBoard tasks={filteredTasks} statusFilter={statusFilter} isDark={isDark} />
        )}
      </main>

      <Footer isDark={isDark} />
    </div>
  );
};

export default App;