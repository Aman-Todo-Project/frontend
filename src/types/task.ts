export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const STATUSES = ['In Progress', 'Completed'] as const;

export type Priority = (typeof PRIORITIES)[number];
export type TaskStatus = (typeof STATUSES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO 8601 (UTC)
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  scheduledAt: string;
  priority?: Priority;
}

export interface WeekGroup {
  weekStart: string; // YYYY-MM-DD (Monday, local)
  weekEnd: string; // YYYY-MM-DD (Sunday, local)
  openTasks: number;
  completedTasks: number;
  totalTasks: number;
  tasks: Task[];
}

export type FieldErrors = Partial<Record<string, string>>;
