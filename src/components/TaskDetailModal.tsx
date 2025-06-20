"use client";

import { Task } from "@/types/task";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "./ui/textarea";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ListTodo,
  Tag,
  X,
  Trash2,
  Plus,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { TASK_LABELS, getLabelColor, getLabelName } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export function TaskDetailModal({ task, open, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [deadline, setDeadline] = useState(task.deadline || "");
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [labels, setLabels] = useState(task.labels || []);
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: uuidv4(), title: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask("");
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddLabel = (labelValue: string) => {
    if (!labels.includes(labelValue)) {
      setLabels((prev) => [...prev, labelValue]);
    }
  };

  const handleRemoveLabel = (labelValue: string) => {
    setLabels((prev) => prev.filter((l) => l !== labelValue));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description,
      deadline,
      subtasks,
      labels,
    };
    onSave(updatedTask);
    onClose();
  };

  // Tính % subtasks đã hoàn thành
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Lọc labels chưa được thêm
  const availableLabels = TASK_LABELS.filter(label => !labels.includes(label.value));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Chi tiết task: {title}</DialogTitle>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 flex-1">
            <ListTodo className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-300 rounded-none px-0 h-auto"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlignLeft className="w-4 h-4" />
                <span>Description</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add detailed description..."
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckSquare className="w-4 h-4" />
                <span>Subtasks</span>
                {totalSubtasks > 0 && (
                  <span className="text-xs">
                    ({completedSubtasks}/{totalSubtasks})
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalSubtasks > 0 && (
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                  >
                    <Checkbox
                      checked={sub.completed}
                      onCheckedChange={() => handleToggleSubtask(sub.id)}
                    />
                    <span
                      className={
                        sub.completed ? "line-through text-gray-400" : "text-gray-700"
                      }
                    >
                      {sub.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-red-100 p-1 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add new subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubtask();
                  }}
                />
                <Button onClick={handleAddSubtask}>Add</Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Deadline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline
              </Label>
              <Input
                type="date"
                value={deadline ? new Date(deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </Label>
              
              {/* Current Labels */}
              <div className="flex flex-wrap gap-1 mb-2">
                {labels.map((label) => (
                  <Badge
                    key={label}
                    className={`${getLabelColor(label)} text-white cursor-pointer hover:opacity-80`}
                    onClick={() => handleRemoveLabel(label)}
                  >
                    {getLabelName(label)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>

              {/* Add Labels Dropdown */}
              {availableLabels.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Label
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {availableLabels.map((label) => (
                      <DropdownMenuItem
                        key={label.value}
                        onClick={() => handleAddLabel(label.value)}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-3 h-3 rounded-full ${label.color}`} />
                        {label.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
