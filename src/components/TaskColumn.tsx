"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskDetailModal } from "./TaskDetailModal";
import { MoreHorizontal, Plus } from "lucide-react";

interface Props {
  title: string;
  status: "todo" | "in-progress" | "done";
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId: string;
  isEditable?: boolean;
}

export function TaskColumn({
  title,
  status,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  projectId,
  isEditable = false,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSaveTask = (updatedTask: Task) => {
    if (selectedTask && onUpdateTask) {
      onUpdateTask(updatedTask);
    } else if (onAddTask) {
      onAddTask(updatedTask);
    }
    setSelectedTask(null);
  };

  const handleAddNewTask = () => {
    if (!newTitle.trim() || !onAddTask) return;

    const newTask: Task = {
      id: uuidv4(),
      projectId,
      title: newTitle.trim(),
      status,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewTitle("");
    setIsAdding(false);
  };

  // Đảm bảo không có task trùng ID
  const uniqueTasks = tasks.reduce<Task[]>((acc, current) => {
    const exists = acc.find(task => task.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[500px] flex flex-col">
      {/* Column Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-gray-700">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2">
            {uniqueTasks.length}
          </span>
        </div>
        {isEditable && (
          <button className="p-1 hover:bg-gray-200 rounded transition">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Tasks List */}
      <Droppable droppableId={status} isDropDisabled={!isEditable}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-gray-100" : ""
            }`}
          >
            <div className="space-y-2">
              {uniqueTasks.map((task, index) => (
                <Draggable 
                  key={task.id} 
                  draggableId={task.id} 
                  index={index}
                  isDragDisabled={!isEditable}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? "rotate-2" : ""
                      }`}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>

            {/* Add Task Form */}
            {isEditable && (
              isAdding ? (
                <div className="mt-2 bg-white rounded-lg border p-2 shadow-sm space-y-2">
                  <Input
                    autoFocus
                    placeholder="Enter card title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddNewTask();
                      if (e.key === "Escape") handleCancel();
                    }}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNewTask}>
                      Add card
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-2 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full p-2 rounded transition"
                >
                  <Plus className="w-4 h-4" />
                  Add card
                </button>
              )
            )}
          </div>
        )}
      </Droppable>

      {/* Task Detail Modal */}
      {selectedTask && onUpdateTask && (
        <TaskDetailModal
          task={selectedTask}
          open={true}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
