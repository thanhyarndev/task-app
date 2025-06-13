"use client";

import { Task } from "@/types/task";
import { Card } from "./ui/card";
import { AlignLeft, Clock, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  task: Task;
  onClick: () => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onClick, onDelete }: Props) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening task detail modal
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  // Overdue logic
  const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date();

  return (
    <Card
      className={`p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group bg-white ${isOverdue ? 'border-red-500 border-2' : ''}`}
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Header with title and menu */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center gap-1">
            {task.title}
            {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" title="Task is overdue" />}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 p-1 rounded transition">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {task.description && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AlignLeft className="w-3.5 h-3.5" />
            <p className="line-clamp-2">{task.description}</p>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Subtasks counter */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                {task.subtasks.filter((st) => st.completed).length} /{" "}
                {task.subtasks.length} subtasks
              </div>
            )}
            
            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(task.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
