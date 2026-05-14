import api from './axiosInstance';
import type { IProject } from '../types/project';

export const getProjects = async (): Promise<IProject[]> => {
  const response = await api.get<IProject[]>('/api/projects');
  return response.data;
};

export const createProject = async (name: string): Promise<IProject> => {
  const response = await api.post<IProject>('/api/projects', { name });
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
