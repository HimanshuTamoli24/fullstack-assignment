"use client";

import React, { useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  FolderKanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";

interface ProjectsViewProps {
  projects: any[];
  onOpenCreateProject: () => void;
  onOpenCreateTask: (defaultProjectId?: string) => void;
  onFilterByProject: (projectId: string) => void;
  isAdmin: boolean;
}

export function ProjectsView({
  projects,
  onOpenCreateProject,
  onOpenCreateTask,
  onFilterByProject,
  isAdmin,
}: ProjectsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Project Initiatives</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage high-level project milestones, track deliverables, and allocate team members.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={onOpenCreateProject}
            size="sm"
            className="h-9 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Project</span>
          </Button>
        )}
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground">
            No projects created yet.
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
              overdueTasks: 0,
            };

            return (
              <div
                key={proj._id || proj.id}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Color bar & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: proj.color || "#6366f1" }}
                      />
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {proj.status || "ACTIVE"}
                      </Badge>
                    </div>

                    <span className="text-xs font-bold text-foreground">
                      {metrics.progressPercent}% Done
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {proj.description || "No description provided."}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <Progress value={metrics.progressPercent} className="h-2 bg-muted" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {metrics.completedTasks} of {metrics.totalTasks} Tasks Completed
                      </span>
                      {metrics.overdueTasks > 0 && (
                        <span className="text-red-600 font-bold">
                          ⚠️ {metrics.overdueTasks} Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Target:{" "}
                      {proj.targetEndDate
                        ? format(new Date(proj.targetEndDate), "MMM d, yyyy")
                        : "TBD"}
                    </span>
                  </div>

                  {/* Team Members */}
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Project Team ({proj.memberIds?.length || 0})
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {proj.memberIds && proj.memberIds.length > 0 ? (
                        proj.memberIds.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            title={m.fullName}
                            className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[11px]"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={m.avatarUrl} />
                              <AvatarFallback className="text-[8px]">
                                {m.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[80px] font-medium">
                              {m.fullName?.split(" ")[0]}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No members assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterByProject(proj._id || proj.id)}
                    className="h-8 text-xs font-semibold text-primary p-0 hover:bg-transparent"
                  >
                    View Tasks & Board →
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenCreateTask(proj._id || proj.id)}
                      className="h-7 text-[11px] gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Task</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
