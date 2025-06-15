"use client";

import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { Task } from "@/types/task";
import { ProjectCard } from "@/components/ProjectCard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Filter } from "lucide-react";
import { getAllProjects, getTasksByProject, updateProject, deleteProject } from "@/lib/api.service";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "On Track", value: "ontrack" },
  { label: "Overdue", value: "overdue" },
  { label: "Done", value: "done" },
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      setLoading(true);
      const projectsFromApi = await getAllProjects();
      setProjects(projectsFromApi);
      // Fetch tasks for each project
      const tasksMap: Record<string, Task[]> = {};
      await Promise.all(
        projectsFromApi.map(async (project) => {
          const tasks = await getTasksByProject(project.id);
          tasksMap[project.id] = tasks;
        })
      );
      setProjectTasks(tasksMap);
      setLoading(false);
    };
    fetchProjectsAndTasks();
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!isAuthenticated) return;
    const project = await updateProject(updatedProject.id, updatedProject);
    setProjects(prev =>
      prev.map(p => p.id === updatedProject.id ? project : p)
    );
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!isAuthenticated) return;
    await deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setProjectTasks(prev => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
  };

  // Filter logic
  const filteredProjects = projects.filter((project) => {
    const tasks = projectTasks[project.id] || [];
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
    const isOverdue = overdueTasks > 0;
    const isDone = totalTasks > 0 && doneTasks === totalTasks;
    const isOnTrack = !isOverdue && !isDone && totalTasks > 0;

    // Search by name
    if (search && !project.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === "all") return true;
    if (filter === "overdue") return isOverdue;
    if (filter === "done") return isDone;
    if (filter === "ontrack") return isOnTrack;
    return true;
  });

  if (loading) {
    return (
      <main className="container mx-auto py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-1 gap-2 items-center justify-end">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Overview Skeleton */}
        <div className="mt-10">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <div className="flex flex-1 gap-2 items-center justify-end">
          <div className="relative w-full max-w-xs">
            <Input
              placeholder="Search project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            className="border rounded px-3 py-2 text-sm ml-2"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {isAuthenticated ? (
            <>
              <Button onClick={() => router.push("/project/new")}> 
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push("/login")}> 
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={projectTasks[project.id] || []}
            onClick={() => handleProjectClick(project.id)}
            onUpdate={isAuthenticated ? handleUpdateProject : undefined}
            onDelete={isAuthenticated ? handleDeleteProject : undefined}
          />
        ))}
      </div>

      {/* Dashboard tổng quan */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Overall Dashboard</h2>
        <DashboardOverview projects={filteredProjects} projectTasks={projectTasks} />
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects found</p>
          {isAuthenticated && (
            <Button onClick={() => router.push("/project/new")}> 
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
