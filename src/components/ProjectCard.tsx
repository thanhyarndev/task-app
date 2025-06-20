'use client';

import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  onClick?: () => void;
  onUpdate?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, tasks = [], onClick, onUpdate, onDelete }: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(project);

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Progress & overdue logic
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const isOverdue = overdueTasks > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedProject);
    }
    setIsEditDialogOpen(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card
        className={`hover:shadow-lg cursor-pointer transition-all group relative ${isOverdue ? 'border-red-500 border-2' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center gap-2">
            <span className="truncate flex items-center gap-1">
              {project.title}
              {isOverdue && (
                <AlertTriangle className="w-4 h-4 text-red-500" title="Project has overdue tasks" />
              )}
            </span>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 p-1 rounded transition">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleDeleteClick}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {project.description && (
            <div className="text-gray-600 text-xs line-clamp-2">
              {project.description}
            </div>
          )}
          <div>🗓 Deadline: {formatDate(project.deadline)}</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progress === 100 ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span>{doneTasks} done</span>
                <span>{overdueTasks} overdue</span>
                <span>{totalTasks} total</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project name</Label>
              <Input
                id="title"
                value={editedProject.title}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedProject.description || ''}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, description: e.target.value })
                }
                placeholder="Describe your project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={editedProject.priority}
                onValueChange={(value) =>
                  setEditedProject({ ...editedProject, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={new Date(editedProject.deadline).toISOString().split('T')[0]}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, deadline: new Date(e.target.value).toISOString() })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
