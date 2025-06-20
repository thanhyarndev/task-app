export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string;
  subtasks: Subtask[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}