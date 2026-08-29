"use client";

import React from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ArrowRight,
  Plus,
  Activity as ActivityIcon,
  TrendingUp,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface DashboardOverviewProps {
  projects: any[];
  tasks: any[];
  activities: any[];
  onSelectTask: (taskId: string) => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  onNavigateTab: (tab: string) => void;
  currentUserId?: string;
  isAdmin: boolean;
}

export function DashboardOverview({
  projects,
  tasks,
  activities,
  onSelectTask,
  onOpenCreateProject,
  onOpenCreateTask,
  onNavigateTab,
  currentUserId,
  isAdmin,
}: DashboardOverviewProps) {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;

  const myTasks = currentUserId
    ? tasks.filter((t) => {
        const aid = t.assigneeId?._id || t.assigneeId?.id || t.assigneeId;
        return aid === currentUserId;
      })
    : [];

  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.deadline && new Date(t.deadline).getTime() < Date.now(),
  );

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Projects */}
        <div
          onClick={() => onNavigateTab("projects")}
          className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Projects</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{totalProjects}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">
              View all workspaces →
            </p>
          </div>
        </div>

        {/* Card 2: Total Tasks */}
        <div
          onClick={() => onNavigateTab("kanban")}
          className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{totalTasks}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">
              {inProgressTasks} currently in progress
            </p>
          </div>
        </div>

        {/* Card 3: My Assigned */}
        <div
          onClick={() => onNavigateTab("list")}
          className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">My Assigned</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{myTasks.length}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">
              Assigned to you →
            </p>
          </div>
        </div>

        {/* Card 4: Completion Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Completion Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {completionRate}%
            </h3>
            <Progress value={completionRate} className="h-1.5 mt-2 bg-muted" />
          </div>
        </div>

        {/* Card 5: Overdue */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Overdue Tasks</span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${overdueTasks.length > 0 ? "bg-red-500/15 text-red-600" : "bg-muted text-muted-foreground"}`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-black tracking-tight ${overdueTasks.length > 0 ? "text-red-600" : "text-foreground"}`}
            >
              {overdueTasks.length}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {overdueTasks.length > 0
                ? "Needs deadline adjustment"
                : "All deliverables on schedule"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Section: Project Progress Breakdown & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects Progress Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Active Projects & Progress</h2>
              <p className="text-xs text-muted-foreground">
                Real-time status breakdown across all project initiatives.
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCreateProject}
                className="h-8 text-xs font-semibold gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                No active projects yet.
              </div>
            ) : (
              projects.map((proj) => {
                const metrics = proj.metrics || {
                  totalTasks: 0,
                  completedTasks: 0,
                  progressPercent: 0,
                  inProgressTasks: 0,
                  todoTasks: 0,
                  inReviewTasks: 0,
                };

                return (
                  <div
                    key={proj._id || proj.id}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || "#6366f1" }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{proj.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {proj.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {metrics.progressPercent}% Completed
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress value={metrics.progressPercent} className="h-2 bg-muted" />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-3">
                          <span>✅ {metrics.completedTasks} Done</span>
                          <span>⚡ {metrics.inProgressTasks} In Progress</span>
                          <span>👀 {metrics.inReviewTasks} In Review</span>
                          <span>📋 {metrics.todoTasks} Todo</span>
                        </div>
                        <span>
                          Target:{" "}
                          {proj.targetEndDate
                            ? format(new Date(proj.targetEndDate), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Team Members */}
                    {proj.memberIds && proj.memberIds.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-[11px] text-muted-foreground">Team Members:</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {proj.memberIds.map((m: any, idx: number) => (
                            <Avatar key={idx} className="h-6 w-6 ring-2 ring-background">
                              <AvatarImage src={m.avatarUrl} />
                              <AvatarFallback className="text-[9px]">
                                {m.fullName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Recent Activity Trail</h2>
              <p className="text-xs text-muted-foreground">
                Live updates & deadline modifications.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-center py-8 text-xs text-muted-foreground">
                No recent activities logged.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act._id || act.id}
                  className="flex items-start gap-3 rounded-xl border border-border/40 p-3 text-xs bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <ActivityIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground leading-snug">{act.details}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {act.userName || act.userId?.fullName || "System"} •{" "}
                      {act.createdAt
                        ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })
                        : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
