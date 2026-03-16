import React, { useState } from 'react';
import { 
  Card, Elevation, H5, Text, Button, ButtonGroup, 
  Alert, Intent, Dialog, Classes, FormGroup, InputGroup, TextArea 
} from "@blueprintjs/core";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import type { Task, TaskStatus } from '../../types/task';

/**
 * TaskItem Component
 * Now includes Edit Modal (Dialog) and Lifecycle transitions
 */
export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const queryClient = useQueryClient();
  
  // States for Modals
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // States for Edit Form
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  // Status helpers
  const isCompleted = task.status === 'COMPLETED';
  const isInProgress = task.status === 'IN_PROGRESS';

  // Mutation for all PATCH updates (Status or Text)
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Task>) => 
      api.patch(`/tasks/${task.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsEditOpen(false); // Close modal on success
    },
  });

  // Mutation to delete task
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Cycle logic
  const nextStatus: TaskStatus | null = task.status === 'PENDING' ? 'IN_PROGRESS' : isInProgress ? 'COMPLETED' : null;
  const prevStatus: TaskStatus | null = isCompleted ? 'IN_PROGRESS' : isInProgress ? 'PENDING' : null;

  const handleSaveEdit = () => {
    updateMutation.mutate({ title: editTitle, description: editDescription });
  };

  return (
    <>
      <Card 
        elevation={Elevation.ONE} 
        style={{ 
          marginBottom: '10px',
          borderLeft: `5px solid ${isCompleted ? '#0F9960' : isInProgress ? '#2B95D9' : '#D9822B'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1 }}>
          <H5 style={{ margin: 0, textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {task.title}
          </H5>
          <Text ellipsize style={{ color: '#5c7080', fontSize: '12px' }}>{task.description}</Text>
        </div>

        <ButtonGroup minimal>
          {/* Back Action */}
          {prevStatus && (
            <Button icon="undo" onClick={() => updateMutation.mutate({ status: prevStatus })} />
          )}

          {/* Forward Action */}
          {nextStatus && (
            <Button 
              icon="double-chevron-right" 
              intent="primary" 
              onClick={() => updateMutation.mutate({ status: nextStatus })} 
            />
          )}

          {/* EDIT Button (The Pencil) */}
          <Button icon="edit" onClick={() => setIsEditOpen(true)} title="Edit Task" />
          
          <Button icon="trash" intent="danger" onClick={() => setIsAlertOpen(true)} />
        </ButtonGroup>
      </Card>

      {/* EDIT DIALOG (Modal) */}
      <Dialog
        icon="edit"
        onClose={() => setIsEditOpen(false)}
        title="Edit Task Details"
        isOpen={isEditOpen}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Title" labelInfo="(required)">
            <InputGroup 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
            />
          </FormGroup>
          <FormGroup label="Description">
            <TextArea 
              fill={true} 
              style={{ minHeight: '100px' }}
              value={editDescription} 
              onChange={(e) => setEditDescription(e.target.value)} 
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button 
              intent="primary" 
              onClick={handleSaveEdit}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DELETE ALERT */}
      <Alert
        isOpen={isAlertOpen}
        icon="trash"
        intent={Intent.DANGER}
        confirmButtonText="Delete Task"
        cancelButtonText="Cancel"
        onCancel={() => setIsAlertOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      >
        <p>Are you sure you want to delete this task? This cannot be undone.</p>
      </Alert>
    </>
  );
};