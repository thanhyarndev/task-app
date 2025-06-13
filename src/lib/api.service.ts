import { Project } from "@/types/project";
import { Task } from "@/types/task";

// Projects
export const getAllProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects');
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const addProject = async (project: Project): Promise<Project> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to add project');
  return response.json();
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const response = await fetch(`/api/projects/${projectId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
};

export const updateProject = async (projectId: string, project: Project): Promise<Project> => {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
  console.log('Delete response:', {
    status: response.status,
    ok: response.ok,
    statusText: response.statusText
  });
  
  if (response.status === 404) {
    throw new Error('Project not found');
  }
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
};

// Tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const response = await fetch(`/api/projects/${projectId}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const addTask = async (projectId: string, task: Task): Promise<Task> => {
  const response = await fetch(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error('Failed to add task');
  return response.json();
};

export const updateTask = async (taskId: string, task: Partial<Task>): Promise<Task> => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const updateTaskFull = async (taskId: string, task: Task): Promise<Task> => {
  return updateTask(taskId, task);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
};

export const reorderTasks = async (tasks: Task[]): Promise<void> => {
  // Cập nhật từng task một với vị trí mới
  await Promise.all(
    tasks.map((task) => updateTask(task.id, task))
  );
}; 