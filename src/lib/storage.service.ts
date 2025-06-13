import { Project } from "@/types/project";
import { Task } from "@/types/task";

// Projects
export const getAllProjects = (): Project[] => {
  if (typeof window === "undefined") return [];
  const projects = localStorage.getItem("projects");
  return projects ? JSON.parse(projects) : [];
};

export const addProject = (project: Project): void => {
  const projects = getAllProjects();
  projects.push(project);
  localStorage.setItem("projects", JSON.stringify(projects));
};

export const getProjectById = (projectId: string): Project | null => {
  const projects = getAllProjects();
  return projects.find((p) => p.id === projectId) || null;
};

export const updateProject = (projectId: string, updatedProject: Project): void => {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index !== -1) {
    projects[index] = updatedProject;
    localStorage.setItem("projects", JSON.stringify(projects));
  }
};

export const deleteProject = (projectId: string): void => {
  const projects = getAllProjects();
  const filteredProjects = projects.filter((p) => p.id !== projectId);
  localStorage.setItem("projects", JSON.stringify(filteredProjects));

  // Xóa luôn các tasks thuộc project này
  const tasks = getAllTasks();
  const remainingTasks = tasks.filter((t) => t.projectId !== projectId);
  localStorage.setItem("tasks", JSON.stringify(remainingTasks));
};

// Tasks
export const getAllTasks = (): Task[] => {
  if (typeof window === "undefined") return [];
  const tasks = localStorage.getItem("tasks");
  const allTasks = tasks ? JSON.parse(tasks) : [];
  
  // Loại bỏ các task trùng ID, giữ lại task mới nhất
  const uniqueTasks = allTasks.reduce<Task[]>((acc, current) => {
    const existingIndex = acc.findIndex(task => task.id === current.id);
    if (existingIndex !== -1) {
      acc[existingIndex] = current; // Cập nhật task cũ bằng task mới nhất
    } else {
      acc.push(current);
    }
    return acc;
  }, []);

  // Nếu có task trùng ID, cập nhật lại localStorage
  if (uniqueTasks.length !== allTasks.length) {
    localStorage.setItem("tasks", JSON.stringify(uniqueTasks));
  }

  return uniqueTasks;
};

export const getTasksByProject = (projectId: string): Task[] => {
  const tasks = getAllTasks();
  return tasks.filter((task) => task.projectId === projectId);
};

export const addTask = (task: Task): void => {
  const tasks = getAllTasks();
  // Kiểm tra xem task.id đã tồn tại chưa
  const exists = tasks.some(t => t.id === task.id);
  if (!exists) {
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
};

export const updateTask = (taskId: string, updatedTask: Partial<Task>): void => {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedTask };
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
};

export const updateTaskFull = (taskId: string, task: Task): void => {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = task;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
};

export const deleteTask = (taskId: string): void => {
  const tasks = getAllTasks();
  const filteredTasks = tasks.filter((t) => t.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(filteredTasks));
};

export const reorderTasks = (tasks: Task[]): void => {
  const allTasks = getAllTasks();
  // Lọc ra các task không thuộc project hiện tại
  const otherTasks = allTasks.filter(
    (t) => !tasks.some((newTask) => newTask.id === t.id)
  );
  // Gộp lại và lưu
  localStorage.setItem("tasks", JSON.stringify([...otherTasks, ...tasks]));
}; 