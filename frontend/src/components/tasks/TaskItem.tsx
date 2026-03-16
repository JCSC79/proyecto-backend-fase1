import React, { useState } from 'react';
import { 
  Card, Elevation, H5, Text, Button, ButtonGroup, 
  Alert, Intent, Dialog, Classes, FormGroup, InputGroup, TextArea,
  Tag
} from "@blueprintjs/core";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import type { Task, TaskStatus } from '../../types/task';

/**
 * TaskItem Component
 * Handles task display, lifecycle transitions, editing, and detailed read-only view.
 * The ID is hidden and 'uppercase' prop error is fixed with CSS.
 */
export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const queryClient = useQueryClient();
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const isPending = task.status === 'PENDING';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isCompleted = task.status === 'COMPLETED';

  const statusIntent = isCompleted ? Intent.SUCCESS : isInProgress ? Intent.PRIMARY : Intent.WARNING;

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Task>) => api.patch(`/tasks/${task.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const nextStatus: TaskStatus | null = isPending ? 'IN_PROGRESS' : isInProgress ? 'COMPLETED' : null;
  const prevStatus: TaskStatus | null = isCompleted ? 'IN_PROGRESS' : isInProgress ? 'PENDING' : null;

  return (
    <>
      <Card 
        elevation={Elevation.ONE} 
        interactive={true}
        style={{ 
          marginBottom: '12px',
          padding: '12px',
          borderLeft: `6px solid ${isCompleted ? '#0F9960' : isInProgress ? '#2B95D9' : '#D9822B'}`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div onClick={() => setIsDetailsOpen(true)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <H5 style={{ 
            margin: 0, 
            textDecoration: isCompleted ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {task.title}
          </H5>
          <Text ellipsize style={{ color: '#5c7080', fontSize: '12px' }}>
            {task.description || "No description"}
          </Text>
        </div>

        <ButtonGroup minimal style={{ flexShrink: 0 }}>
          {prevStatus && (
            <Button icon="undo" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ status: prevStatus }); }} />
          )}
          {nextStatus && (
            <Button icon="double-chevron-right" intent="primary" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ status: nextStatus }); }} />
          )}
          <Button icon="edit" onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }} />
          <Button icon="trash" intent="danger" onClick={(e) => { e.stopPropagation(); setIsAlertOpen(true); }} />
        </ButtonGroup>
      </Card>

      <Dialog icon="info-sign" onClose={() => setIsDetailsOpen(false)} title="Task Details" isOpen={isDetailsOpen}>
        <div className={Classes.DIALOG_BODY}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <H5 style={{ margin: 0 }}>{task.title}</H5>
            <Tag intent={statusIntent} large round style={{ textTransform: 'uppercase' }}>
              {task.status.replace('_', ' ')}
            </Tag>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f5f8fa', borderRadius: '8px', border: '1px solid #dbe3e8', whiteSpace: 'pre-wrap', minHeight: '100px' }}>
            <Text style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {task.description || "No additional details provided for this task."}
            </Text>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            <Button intent="primary" icon="edit" onClick={() => { setIsDetailsOpen(false); setIsEditOpen(true); }}>
              Edit Task
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog icon="edit" onClose={() => setIsEditOpen(false)} title="Edit Task" isOpen={isEditOpen}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Task Title" labelInfo="(required)">
            <InputGroup value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </FormGroup>
          <FormGroup label="Description">
            <TextArea fill style={{ minHeight: '120px' }} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button intent="primary" onClick={() => updateMutation.mutate({ title: editTitle, description: editDescription })} loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      <Alert isOpen={isAlertOpen} icon="trash" intent={Intent.DANGER} confirmButtonText="Delete Task" cancelButtonText="Cancel" onCancel={() => setIsAlertOpen(false)} onConfirm={() => deleteMutation.mutate()}>
        <p>Are you sure you want to delete <b>{task.title}</b>? This action is permanent.</p>
      </Alert>
    </>
  );
};