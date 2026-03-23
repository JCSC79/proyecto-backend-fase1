import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api/axiosInstance';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TaskFilters } from './components/tasks/TaskFilters';
import { TaskForm } from './components/tasks/TaskForm';
import { TaskBoard } from './components/tasks/TaskBoard';
import { DashboardView } from './components/dashboard/DashboardView';
import { LoginView } from './views/LoginView'; 
import type { Task, TaskStatus } from './types/task';
import { useTranslation } from 'react-i18next';

// BLUEPRINT COMPONENTS: UI refinement for Phase 4
import { Spinner, NonIdealState, Button, Intent, Icon } from '@blueprintjs/core';
import { AppToaster } from './utils/toaster'; 

interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: { error?: string };
  };
  message: string;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // AUTH STATE: Manage session token and user identity
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'dashboard'>('home');

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('bp4-dark');
      document.body.style.backgroundColor = '#202b33'; 
    } else {
      document.body.classList.remove('bp4-dark');
      document.body.style.backgroundColor = '#f5f8fa'; 
    }
  }, [isDark]);

  const { data: tasks, isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data;
    },
    enabled: !!token,
    meta: {
      onError: (err: unknown) => {
        const axiosErr = err as AxiosErrorResponse;
        if (axiosErr.response?.status === 401) {
          handleLogout();
        } else {
          AppToaster.show({
            message: `${t('errorLoadingTasks')}: ${axiosErr.message}`,
            intent: Intent.DANGER, 
            icon: "error"
          });
        }
      }
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    queryClient.clear();
    AppToaster.show({ message: "Logged out", icon: "log-out" });
  };

  const total = tasks?.length || 0;
  const completed = tasks?.filter(t => t.status === 'COMPLETED').length || 0;
  const progressValue = total > 0 ? completed / total : 0;

  const handleDashboardClick = (status: TaskStatus) => {
    setSearchTerm('');
    setStatusFilter(status);
    setActiveView('home');
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  if (!token) {
    return (
      <div className={isDark ? "bp4-dark" : ""} style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: isDark ? '#202b33' : '#f5f8fa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px', gap: '10px' }}>
          <Button 
            className="bp4-minimal" 
            icon="translate" 
            text={i18n.language.startsWith('es') ? 'EN' : 'ES'} 
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')} 
            large 
          />
          <Button className="bp4-minimal" icon={isDark ? "flash" : "moon"} onClick={() => setIsDark(!isDark)} large />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginView onLoginSuccess={(newToken) => {
            setToken(newToken);
            setUserEmail(localStorage.getItem('userEmail'));
          }} />
        </div>
        <Footer isDark={isDark} />
      </div>
    );
  }

  return (
    <div className={isDark ? "bp4-dark" : ""} style={{ minHeight: '100vh', color: isDark ? '#f5f8fa' : '#182026' }}>
      <Header 
        progress={progressValue} 
        isDark={isDark} 
        toggleDark={() => setIsDark(!isDark)} 
        activeView={activeView}
        setActiveView={setActiveView}
        userEmail={userEmail || ''}
      />
      
      <div style={{ maxWidth: '1400px', margin: '10px auto', padding: '0 20px', textAlign: 'right' }}>
         <Button icon="log-out" minimal text={t('logout')} onClick={handleLogout} intent={Intent.DANGER} />
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto 20px auto', padding: '0 20px' }}>
        {isError && (
          <div style={{ marginTop: '40px', padding: '40px', border: `1px solid ${isDark ? '#5c2526' : '#f5e0e0'}`, borderRadius: '12px', backgroundColor: isDark ? '#29333a' : '#fff1f1' }}>
            <NonIdealState
              icon={<Icon icon="warning-sign" size={60} intent={Intent.DANGER} />} 
              title={t('errorTitle')} 
              description={(error as AxiosErrorResponse)?.message || t('errorMessage')}
              action={<Button intent={Intent.PRIMARY} icon="refresh" onClick={() => refetch()} text={t('retry')} />}
            />
          </div>
        )}

        {activeView === 'home' && !isError && (
          <>
            <div style={{ marginTop: '20px' }}>
              <TaskFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} isDark={isDark} />
              <TaskForm isDark={isDark} />
            </div>
            {isLoading ? (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spinner size={50} intent={Intent.PRIMARY} /><div style={{ marginTop: '15px' }}>{t('syncing')}</div>
              </div>
            ) : (
              <TaskBoard tasks={filteredTasks} statusFilter={statusFilter} isDark={isDark} />
            )}
          </>
        )}
        {activeView === 'dashboard' && !isError && (
          <DashboardView tasks={tasks || []} isDark={isDark} onChartClick={handleDashboardClick} />
        )}
      </main>
      <Footer isDark={isDark} />
    </div>
  );
};

export default App;