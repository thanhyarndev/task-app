// app/project/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { Task } from "@/types/task";
import { TaskColumn } from "@/components/TaskColumn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { getTasksByProject, addTask, updateTask, reorderTasks, updateTaskFull, deleteTask, getProjectById } from "@/lib/api.service";
import { Calendar, ChevronLeft, Clock, Filter, LogIn, Search, Settings, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

const STATUS_LABELS = {
  todo: "📋 To Do",
  "in-progress": "⏳ In Progress",
  done: "✅ Done",
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchProject = async () => {
      setLoading(true);
      setNotFound(false);
      const fetched = await getProjectById(id as string);
      setProject(fetched);
      setLoading(false);
      if (!fetched) {
        timeout = setTimeout(() => setNotFound(true), 3000);
      }
    };
    fetchProject();
    return () => clearTimeout(timeout);
  }, [id]);

  useEffect(() => {
    if (!project?.id) return;
    const fetchTasks = async () => {
      const tasksFromApi = await getTasksByProject(project.id);
      setTasks(tasksFromApi);
    };
    fetchTasks();
  }, [project?.id]);

  const handleAddTask = async (newTask: Task) => {
    if (!isAuthenticated) return;
    const task = await addTask(project!.id, newTask);
    setTasks((prev) => [...prev, task]);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!isAuthenticated) return;
    const task = await updateTaskFull(updatedTask.id, updatedTask);
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isAuthenticated) return;
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!isAuthenticated || !result.destination) return;

    const { source, destination, draggableId } = result;
    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(
      newTasks.findIndex((t) => t.id === draggableId),
      1
    );

    if (source.droppableId === destination.droppableId) {
      const columnTasks = newTasks.filter((t) => t.status === source.droppableId);
      columnTasks.splice(destination.index, 0, movedTask);
      const otherTasks = newTasks.filter((t) => t.status !== source.droppableId);
      const updatedTasks = [...otherTasks, ...columnTasks];
      setTasks(updatedTasks);
      await reorderTasks(updatedTasks);
    } else {
      movedTask.status = destination.droppableId as Task["status"];
      const columnTasks = newTasks.filter((t) => t.status === destination.droppableId);
      columnTasks.splice(destination.index, 0, movedTask);
      const otherTasks = newTasks.filter((t) => t.status !== destination.droppableId);
      const updatedTasks = [...otherTasks, ...columnTasks];
      await updateTask(draggableId, { status: destination.droppableId as Task["status"] });
      setTasks(updatedTasks);
      await reorderTasks(updatedTasks);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        {/* Project Header Skeleton */}
        <div className="bg-white border-b">
          <div className="container mx-auto py-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>

            {/* Toolbar Skeleton */}
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Board Skeleton */}
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <p className="text-gray-500">Please check the URL</p>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in-progress");
  const doneTasks = filteredTasks.filter((task) => task.status === "done");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Project Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {!isAuthenticated && (
              <Button onClick={() => router.push("/login")}> 
                <LogIn className="w-4 h-4 mr-2" />
                Login to edit
              </Button>
            )}
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
              {project.description && (
                <p className="text-gray-600 mb-2 max-w-2xl">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {formatDate(project.deadline)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Progress: {doneTasks.length}/{filteredTasks.length} tasks
                  </span>
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {isAuthenticated && (
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="container mx-auto py-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaskColumn
              title={STATUS_LABELS.todo}
              tasks={todoTasks}
              status="todo"
              onAddTask={isAuthenticated ? handleAddTask : undefined}
              onUpdateTask={isAuthenticated ? handleUpdateTask : undefined}
              onDeleteTask={isAuthenticated ? handleDeleteTask : undefined}
              projectId={project.id}
              isEditable={isAuthenticated}
            />
            <TaskColumn
              title={STATUS_LABELS["in-progress"]}
              tasks={inProgressTasks}
              status="in-progress"
              onAddTask={isAuthenticated ? handleAddTask : undefined}
              onUpdateTask={isAuthenticated ? handleUpdateTask : undefined}
              onDeleteTask={isAuthenticated ? handleDeleteTask : undefined}
              projectId={project.id}
              isEditable={isAuthenticated}
            />
            <TaskColumn
              title={STATUS_LABELS.done}
              tasks={doneTasks}
              status="done"
              onAddTask={isAuthenticated ? handleAddTask : undefined}
              onUpdateTask={isAuthenticated ? handleUpdateTask : undefined}
              onDeleteTask={isAuthenticated ? handleDeleteTask : undefined}
              projectId={project.id}
              isEditable={isAuthenticated}
            />
          </div>
        </DragDropContext>
      </div>
    </main>
  );
}
