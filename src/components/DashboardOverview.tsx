import { Project } from "@/types/project";
import { Task } from "@/types/task";

interface Props {
  projects: Project[];
  projectTasks: Record<string, Task[]>;
}

export function DashboardOverview({ projects, projectTasks }: Props) {
  // Tổng hợp số liệu
  const totalProjects = projects.length;
  const allTasks = projects.flatMap(p => projectTasks[p.id] || []);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const overdueTasks = allTasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-2xl font-bold">{totalProjects}</span>
        <span className="text-gray-500">Projects</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-2xl font-bold">{totalTasks}</span>
        <span className="text-gray-500">Tasks</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-2xl font-bold text-green-600">{doneTasks}</span>
        <span className="text-gray-500">Done</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-2xl font-bold text-red-600">{overdueTasks}</span>
        <span className="text-gray-500">Overdue</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-2xl font-bold">{progress}%</span>
        <span className="text-gray-500">Progress</span>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div
            className={`h-full ${progress === 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 