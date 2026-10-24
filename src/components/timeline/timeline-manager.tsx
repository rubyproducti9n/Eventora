"use client";

import React, { useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { TimelineMilestone, TaskPriority, TaskCategory } from "@/types/event";
import { isTaskOverdue, sortMilestones, calculatePlanningProgress } from "@/lib/tasks/task-calculations";
import { formatDate } from "@/lib/utils";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Modal,
  Progress,
} from "@/components/ui";

interface TimelineManagerProps {
  eventId: string;
  eventDate: string;
  milestones: TimelineMilestone[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TimelineMilestone, "id">) => void;
  onUpdateTask: (task: TimelineMilestone) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TimelineManager({
  eventDate,
  milestones,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: TimelineManagerProps) {
  const sortedMilestones = sortMilestones(milestones);
  const progress = calculatePlanningProgress(milestones, [], eventDate);

  // Modal State for Add / Edit Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("4 Weeks Before");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<TaskCategory>("preparation");
  const [fieldError, setFieldError] = useState<string | null>(null);

  // State for Task Deletion
  const [taskToDelete, setTaskToDelete] = useState<TimelineMilestone | null>(null);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setTimeframe("2 Weeks Before");
    setDueDate("");
    setPriority("medium");
    setCategory("preparation");
    setFieldError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TimelineMilestone) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setTimeframe(task.timeframe);
    setDueDate(task.dueDate || "");
    setPriority(task.priority || "medium");
    setCategory(task.category || "preparation");
    setFieldError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFieldError("Task title is required");
      return;
    }

    if (editingTaskId) {
      const existing = milestones.find((m) => m.id === editingTaskId);
      if (existing) {
        onUpdateTask({
          ...existing,
          title: title.trim(),
          description: description.trim(),
          timeframe: timeframe.trim() || "General",
          dueDate: dueDate || undefined,
          priority,
          category,
        });
      }
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim() || "Milestone preparation step",
        timeframe: timeframe.trim() || "General",
        dueDate: dueDate || undefined,
        priority,
        category,
        isCompleted: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Timeline Progress Banner */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Preparation Timeline & Milestones</CardTitle>
                <p className="text-xs text-slate-500">Track deadlines and run sheet activities</p>
              </div>
            </div>
            <Button size="sm" onClick={openCreateModal} className="text-xs gap-1.5 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Total Tasks</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{progress.totalTasks}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Completed</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{progress.completedTasks}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Pending</p>
              <p className="text-xl font-bold text-indigo-600 mt-0.5">{progress.pendingTasks}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Overdue</p>
              <p className={`text-xl font-bold mt-0.5 ${progress.overdueTasks > 0 ? "text-rose-600" : "text-slate-800"}`}>
                {progress.overdueTasks}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
              <span>Overall Timeline Completion</span>
              <span>{progress.taskPercentage}%</span>
            </div>
            <Progress value={progress.completedTasks} max={progress.totalTasks || 1} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Chronological Milestones List */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Scheduled Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {sortedMilestones.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs">No milestones created yet.</p>
              <Button size="sm" variant="outline" onClick={openCreateModal} className="text-xs mt-2">
                Add First Milestone
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedMilestones.map((m) => {
                const overdue = isTaskOverdue(m, eventDate);

                return (
                  <div
                    key={m.id}
                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 rounded-lg transition-colors group ${
                      m.isCompleted ? "opacity-60 bg-slate-50/40" : overdue ? "bg-rose-50/40 border border-rose-100" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleTask(m.id)}
                        className={`h-5 w-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          m.isCompleted
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 group-hover:border-indigo-400 bg-white"
                        }`}
                        aria-label={m.isCompleted ? "Mark incomplete" : "Mark complete"}
                      >
                        {m.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              m.isCompleted ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
                            {m.title}
                          </span>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {m.category}
                          </Badge>
                          {m.priority && (
                            <Badge
                              variant={m.priority === "urgent" || m.priority === "high" ? "destructive" : "outline"}
                              className="text-[10px] capitalize"
                            >
                              {m.priority}
                            </Badge>
                          )}
                          {overdue && (
                            <Badge variant="destructive" className="text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <p className={`text-xs ${m.isCompleted ? "line-through text-slate-300" : "text-slate-500"}`}>
                          {m.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="font-semibold text-indigo-600 uppercase tracking-wide">
                            {m.timeframe}
                          </span>
                          {m.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(m.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(m)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                        title="Edit Milestone"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTaskToDelete(m)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Delete Milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Add / Edit Milestone */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? "Edit Preparation Milestone" : "Add Preparation Milestone"}
        description="Set the title, due window, priority, and task details."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
              {fieldError}
            </div>
          )}

          <Input
            label="Milestone Title *"
            placeholder="e.g. Schedule final floral design mockup"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description / Checklist Notes"
            placeholder="e.g. Confirm table count with florist and review sample centerpiece"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Timeframe Reference *"
              placeholder="e.g. 4 Weeks Before, Day Before"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              required
            />

            <Input
              label="Specific Due Date (Optional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              options={[
                { value: "low", label: "Low Priority" },
                { value: "medium", label: "Medium Priority" },
                { value: "high", label: "High Priority" },
                { value: "urgent", label: "Urgent Priority" },
              ]}
            />

            <Select
              label="Planning Stage"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              options={[
                { value: "planning", label: "Early Planning" },
                { value: "booking", label: "Vendor Booking" },
                { value: "preparation", label: "Final Preparation" },
                { value: "day_of", label: "Day of Event" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingTaskId ? "Save Changes" : "Create Milestone"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Task Deletion */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Milestone"
        description="Are you sure you want to remove this milestone?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Removing <strong>{taskToDelete?.title}</strong> will remove it permanently from your preparation timeline.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Delete Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
