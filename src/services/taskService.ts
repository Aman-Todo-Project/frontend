import { api } from './api';
import type { Task, TaskInput, TaskStatus, WeekGroup } from '../types/task';

export const taskService = {
  async getWeekly(params: { tz: string; startDate?: string; endDate?: string }): Promise<WeekGroup[]> {
    const { data } = await api.get<WeekGroup[]>('/tasks/weekly', { params });
    return data;
  },

  async search(q: string, signal?: AbortSignal): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks/search', { params: { q }, signal });
    return data;
  },

  async create(input: TaskInput): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', input);
    return data;
  },

  async update(id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${id}`, input);
    return data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
