"use client";

import React, { useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Search,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  Plus,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";

interface TaskListViewProps {
  tasks: any[];
  projects: any[];
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  currentUserId?: string;
  isAdmin: boolean;
}

export function TaskListView({
  tasks,
  projects,
  onSelectTask,
  onOpenCreateTask,
  onUpdateStatus,
  currentUserId,
  isAdmin,
}: TaskListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Filter tasks locally
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTags = t.tags?.some((tag: string) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // Project
    if (projectFilter !== "ALL") {
      const pid = t.projectId?._id || t.projectId?.id || t.projectId;
      if (pid !== projectFilter) return false;
    }

    // Status
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

    // Priority
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;

    // My Tasks Only
    if (myTasksOnly && currentUserId) {
      const aid = t.assigneeId?._id || t.assigneeId?.id || t.assigneeId;
      if (aid !== currentUserId) return false;
    }

    return true;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return (
          <Badge className="bg-red-500/15 text-red-700 border-red-200 text-[10px]">🚨 Urgent</Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px]">
            ⚡ High
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 text-[10px]">🔹 Med</Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-slate-500/15 text-slate-700 border-slate-200 text-[10px]">
            ☕ Low
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "TODO":
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            📋 To Do
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            ⚡ In Progress
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            👀 In Review
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            ✅ Completed
          </span>
        );
      default:
        return s;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, descriptions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Project Filter */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* My Tasks Toggle & Create Task */}
        <div className="flex items-center gap-2">
          {currentUserId && (
            <Button
              variant={myTasksOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setMyTasksOnly(!myTasksOnly)}
              className="h-9 text-xs gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>{myTasksOnly ? "Showing My Tasks" : "My Assigned"}</span>
            </Button>
          )}

          {isAdmin && (
            <Button
              size="sm"
              onClick={onOpenCreateTask}
              className="h-9 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Task Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3.5 px-4">Task Details</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Deadline & History</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-semibold">No tasks found matching criteria</p>
                    <p className="text-xs mt-1">Try relaxing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue =
                    task.deadline &&
                    task.status !== "COMPLETED" &&
                    new Date(task.deadline).getTime() < Date.now();
                  const revisionsCount = task.deadlineHistory?.length || 0;

                  return (
                    <tr
                      key={task._id || task.id}
                      onClick={() => onSelectTask(task._id || task.id)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: task.projectId?.color || "#6366f1" }}
                          />
                          <span className="font-medium text-foreground truncate max-w-[130px]">
                            {task.projectId?.name || "Project"}
                          </span>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4">
                        {task.assigneeId ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assigneeId.avatarUrl} />
                              <AvatarFallback className="text-[10px]">
                                {task.assigneeId.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{task.assigneeId.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(task.status)}</td>

                      {/* Deadline & Revision Count */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue ? "text-red-600 font-semibold" : "text-foreground"
                            }`}
                          >
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{format(new Date(task.deadline), "MMM d, yyyy")}</span>
                            {isOverdue && (
                              <span className="text-[10px] text-red-600 font-bold">⚠️ Overdue</span>
                            )}
                          </div>

                          {revisionsCount > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                              <History className="h-2.5 w-2.5" />
                              <span>
                                {revisionsCount} {revisionsCount === 1 ? "revision" : "revisions"}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quick Advance / Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task._id || task.id);
                          }}
                          className="h-7 text-xs font-semibold text-primary"
                        >
                          Specs & Timeline →
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
