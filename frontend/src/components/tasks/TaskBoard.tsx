import React from 'react';
import { TaskItem } from './TaskItem';
import type { Task, TaskStatus } from '../../types/task';
import { useTranslation } from 'react-i18next';

interface TaskBoardProps {
  tasks: Task[];
  statusFilter: TaskStatus | 'ALL';
  isDark: boolean; // Prop for Dark Mode
}

/**
 * TaskBoard Component
 * Handles the rendering of the Kanban columns and distributes tasks.
 * Updated to pass isDark prop to children TaskItems.
 */
export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, statusFilter, isDark }) => {
  const { t } = useTranslation();

  const renderColumn = (labelKey: string, status: TaskStatus) => {
    const columnTasks = tasks.filter(task => task.status === status);
    
    return (
      <div style={{ 
        flex: 1, 
        minWidth: '300px', 
        backgroundColor: isDark ? '#293742' : '#ebf1f5', 
        padding: '15px', 
        borderRadius: '8px',
        minHeight: '400px',
        transition: 'background-color 0.3s ease'
      }}>
        <h3 style={{ 
          borderBottom: '2px solid #5c7080', 
          paddingBottom: '10px', 
          marginBottom: '15px',
          color: isDark ? '#f5f8fa' : '#182026',
          display: 'flex',
          justifyContent: 'space-between',
          transition: 'color 0.3s ease'
        }}>
          {t(labelKey)} 
          <span style={{ fontSize: '0.8em', color: '#5c7080' }}>({columnTasks.length})</span>
        </h3>
        
        <div>
          {columnTasks.map((task) => (
            /* We pass the isDark prop to each item */
            <TaskItem key={task.id} task={task} isDark={isDark} />
          ))}
          {columnTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: '#a7b6c2', marginTop: '20px', fontStyle: 'italic' }}>
              {t('noTasks')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '20px', 
      marginTop: '30px',
      alignItems: 'flex-start',
      overflowX: 'auto',
      paddingBottom: '20px'
    }}>
      {(statusFilter === 'ALL' || statusFilter === 'PENDING') && renderColumn('pending', 'PENDING')}
      {(statusFilter === 'ALL' || statusFilter === 'IN_PROGRESS') && renderColumn('inProgress', 'IN_PROGRESS')}
      {(statusFilter === 'ALL' || statusFilter === 'COMPLETED') && renderColumn('completed', 'COMPLETED')}
    </div>
  );
};