export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  subDescription?: string;
  description?: string;
  deadline?: string;
  status: 'todo' | 'in-progress' | 'done'; // ✅ THÊM DÒNG NÀY
  subtasks: { id: string; title: string; done: boolean }[];
  createdAt: string;
}