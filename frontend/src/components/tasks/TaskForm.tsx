import React, { useState } from "react";
import { Card, Elevation, Button, InputGroup, TextArea, FormGroup, H4 } from "@blueprintjs/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosInstance";

/**
 * TaskForm Component
 * UI upgraded to 'large' variants for better accessibility and modern look
 */
export const TaskForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: (newTask: { title: string; description: string }) => api.post("/tasks", newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
      setDescription("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({ title, description });
  };

  return (
    <Card 
      elevation={Elevation.TWO} 
      style={{ marginBottom: "30px", backgroundColor: "#ebf1f5", padding: '25px' }}
    >
      <H4 style={{ marginBottom: '20px' }}>Create New Task</H4>
      
      <form onSubmit={handleSubmit}>
        <FormGroup label="Title" labelFor="title-input" labelInfo="(required)">
          <InputGroup 
            id="title-input" 
            large // Larger input field
            placeholder="What needs to be done?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </FormGroup>

        <FormGroup label="Description" labelFor="description-input">
          <TextArea 
            fill={true} 
            large // Larger text area
            id="description-input" 
            placeholder="Add some details..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ minHeight: '120px', resize: 'vertical' }}
          />
        </FormGroup>

        <Button 
          intent="primary" 
          text="ADD TASK" 
          icon="add"
          type="submit"
          loading={mutation.isPending}
          fill
          large // Much bigger and noticeable button
          style={{ fontWeight: 'bold', letterSpacing: '1px' }}
        />
      </form>
    </Card>
  );
};