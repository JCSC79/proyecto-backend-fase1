import React, { useState } from "react";
import { Card, Elevation, Button, InputGroup, TextArea, FormGroup, H4 } from "@blueprintjs/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosInstance";

/**
 * TaskForm Component
 * Manages the creation of new tasks and synchronizes with the Backend API
 */
export const TaskForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Mutation to send POST request to /tasks
  const mutation = useMutation({
    mutationFn: (newTask: { title: string; description: string }) => {
      return api.post("/tasks", newTask);
    },
    onSuccess: () => {
      // Automatically refetch the list to include the newly created task
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Reset form fields
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
      style={{ marginBottom: "30px", backgroundColor: "#ebf1f5" }}
    >
      <H4>Create New Task</H4>
      
      <form onSubmit={handleSubmit}>
        <FormGroup label="Title" labelFor="title-input" labelInfo="(required)">
          <InputGroup 
            id="title-input" 
            placeholder="What needs to be done?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </FormGroup>

        <FormGroup label="Description" labelFor="description-input">
          <TextArea 
            fill={true} 
            id="description-input" 
            placeholder="Add some details..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ minHeight: '80px' }}
          />
        </FormGroup>

        <Button 
          intent="primary" 
          text="Add Task" 
          icon="add"
          type="submit"
          loading={mutation.isPending}
          fill
        />
      </form>
    </Card>
  );
};