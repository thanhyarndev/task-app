export type Priority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  title: string;
  description?: string;
  deadline: string; // ISO string
  priority: Priority;
}
