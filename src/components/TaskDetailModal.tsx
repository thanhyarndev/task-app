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
} from "lucide-react";
import { Badge } from "./ui/badge";

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
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: uuidv4(), title: newSubtask.trim(), done: false },
    ]);
    setNewSubtask("");
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description,
      deadline,
      subtasks,
    };
    onSave(updatedTask);
    onClose();
  };

  // Tính % subtasks đã hoàn thành
  const completedSubtasks = subtasks.filter((s) => s.done).length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0;

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
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                  >
                    <Checkbox
                      checked={sub.done}
                      onCheckedChange={() => handleToggleSubtask(sub.id)}
                    />
                    <span
                      className={
                        sub.done ? "line-through text-gray-400" : "text-gray-700"
                      }
                    >
                      {sub.title}
                    </span>
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
                value={deadline?.slice(0, 10)}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* Labels - sẽ thêm sau */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </Label>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Feature</Badge>
                <Badge variant="outline">UI</Badge>
                <Badge variant="outline">+ Add Label</Badge>
              </div>
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
