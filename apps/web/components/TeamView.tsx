"use client";

import React, { useState } from "react";
import { useAuth } from "~/context/auth-context";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  Users,
  Shield,
  User as UserIcon,
  CheckCircle2,
  Mail,
  Briefcase,
  Sparkles,
  Building,
  ArrowRight,
} from "lucide-react";

interface TeamViewProps {
  users: any[];
  tasks: any[];
  onOpenAuth: () => void;
  isAdmin: boolean;
}

export function TeamView({ users, tasks, onOpenAuth, isAdmin }: TeamViewProps) {
  const { quickDemoLogin, user: currentUser } = useAuth();

  const getMemberTaskStats = (userId: string) => {
    const memberTasks = tasks.filter((t) => {
      const aid = t.assigneeId?._id || t.assigneeId?.id || t.assigneeId;
      return aid === userId;
    });

    const active = memberTasks.filter((t) => t.status !== "COMPLETED").length;
    const completed = memberTasks.filter((t) => t.status === "COMPLETED").length;

    return { total: memberTasks.length, active, completed };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Workspace Team Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of team members, roles, permissions, and active task workloads.
          </p>
        </div>

        <Button
          onClick={onOpenAuth}
          variant="outline"
          size="sm"
          className="h-9 text-xs font-semibold gap-1.5 border-dashed"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Switch Evaluator Persona</span>
        </Button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground">
            No team members found.
          </div>
        ) : (
          users.map((u) => {
            const uid = u._id || u.id;
            const stats = getMemberTaskStats(uid);
            const isSelf = currentUser?.id === uid;

            return (
              <div
                key={uid}
                className={`flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs transition-all ${
                  isSelf
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/80 hover:border-border"
                }`}
              >
                <div className="space-y-4">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                        <AvatarImage src={u.avatarUrl} />
                        <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                          {u.fullName?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-foreground">{u.fullName}</h3>
                          {isSelf && (
                            <Badge variant="secondary" className="text-[9px] px-1 h-4">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {u.jobTitle || "Team Member"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={u.role === "ADMIN" ? "default" : "outline"}
                      className={`text-[10px] px-2 py-0.5 ${
                        u.role === "ADMIN"
                          ? "bg-indigo-600 text-white"
                          : "text-emerald-700 bg-emerald-50 border-emerald-300"
                      }`}
                    >
                      {u.role === "ADMIN" ? "👑 Admin" : "👤 Member"}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>Department: {u.department || "Engineering"}</span>
                    </div>
                  </div>

                  {/* Task Workload Stats */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3 text-center border border-border/50">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Active
                      </span>
                      <span className="text-sm font-bold text-foreground">{stats.active}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Completed
                      </span>
                      <span className="text-sm font-bold text-emerald-600">{stats.completed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Total
                      </span>
                      <span className="text-sm font-bold text-foreground">{stats.total}</span>
                    </div>
                  </div>
                </div>

                {/* Switch to this user button */}
                <div className="pt-4 mt-4 border-t border-border/50 flex justify-end">
                  {!isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => quickDemoLogin(uid)}
                      className="h-7 text-xs font-semibold text-primary gap-1"
                    >
                      <span>Switch to this user</span>
                      <ArrowRight className="h-3 w-3" />
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
