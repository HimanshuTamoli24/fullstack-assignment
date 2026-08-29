"use client";

import React from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  Calendar,
  History,
  MessageSquare,
  ArrowRight,
  MoreVertical,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface KanbanBoardProps {
  tasks: any[];
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  isAdmin: boolean;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    color: "border-slate-300 bg-slate-500/10 text-slate-700",
    dot: "bg-slate-400",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "border-blue-300 bg-blue-500/10 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    id: "IN_REVIEW",
    title: "In Review",
    color: "border-amber-300 bg-amber-500/10 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "border-emerald-300 bg-emerald-500/10 text-emerald-700",
    dot: "bg-emerald-500",
  },
];

export function KanbanBoard({
  tasks,
  onSelectTask,
  onOpenCreateTask,
  onUpdateStatus,
  isAdmin,
}: KanbanBoardProps) {
  const getTasksByColumn = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return (
          <Badge className="bg-red-500/15 text-red-700 border-red-200 text-[10px] px-1.5 py-0 h-4">
            🚨 Urgent
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 h-4">
            ⚡ High
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-4">
            🔹 Med
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-slate-500/15 text-slate-700 border-slate-200 text-[10px] px-1.5 py-0 h-4">
            ☕ Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {COLUMNS.map((col) => {
        const columnTasks = getTasksByColumn(col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-xs min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {col.title}
                </h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[11px] font-bold text-muted-foreground shadow-xs">
                  {columnTasks.length}
                </span>
              </div>

              {col.id === "TODO" && isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenCreateTask}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Column Task Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl border-border/60">
                  <p>No tasks in {col.title.toLowerCase()}</p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isOverdue =
                    task.deadline &&
                    task.status !== "COMPLETED" &&
                    new Date(task.deadline).getTime() < Date.now();
                  const revisionsCount = task.deadlineHistory?.length || 0;

                  return (
                    <div
                      key={task._id || task.id}
                      onClick={() => onSelectTask(task._id || task.id)}
                      className="group relative cursor-pointer rounded-xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200"
                    >
                      {/* Project Tag & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: task.projectId?.color || "#6366f1" }}
                          />
                          <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[120px]">
                            {task.projectId?.name || "Project"}
                          </span>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1.5">
                        {task.title}
                      </h4>

                      {/* Description Snippet */}
                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Revision indicator pill if deadline was altered */}
                      {revisionsCount > 0 && (
                        <div className="mb-2.5 flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300/60 w-fit">
                          <History className="h-3 w-3 text-amber-600" />
                          <span>
                            {revisionsCount} Deadline{" "}
                            {revisionsCount === 1 ? "Revision" : "Revisions"}
                          </span>
                        </div>
                      )}

                      {/* Footer: Deadline & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(task.deadline), "MMM d")}</span>
                          {isOverdue && <span className="text-[10px]">⚠️</span>}
                        </div>

                        {task.assigneeId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                              {task.assigneeId.fullName?.split(" ")[0]}
                            </span>
                            <Avatar className="h-5 w-5 ring-1 ring-border">
                              <AvatarImage src={task.assigneeId.avatarUrl} />
                              <AvatarFallback className="text-[9px]">
                                {task.assigneeId.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Quick Advance Button on hover */}
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-primary font-semibold">
                          View specs & history →
                        </span>
                        {col.id !== "COMPLETED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus =
                                col.id === "TODO"
                                  ? "IN_PROGRESS"
                                  : col.id === "IN_PROGRESS"
                                    ? "IN_REVIEW"
                                    : "COMPLETED";
                              onUpdateStatus(task._id || task.id, nextStatus);
                            }}
                            className="text-[10px] font-semibold bg-secondary hover:bg-primary hover:text-white px-2 py-0.5 rounded transition-colors"
                          >
                            Advance ⏩
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
