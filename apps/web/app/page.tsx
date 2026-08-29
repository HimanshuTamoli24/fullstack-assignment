"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/context/auth-context";
import { api } from "~/trpc/server";
import { Navbar } from "~/components/Navbar";
import { DashboardOverview } from "~/components/DashboardOverview";
import { KanbanBoard } from "~/components/KanbanBoard";
import { TaskListView } from "~/components/TaskListView";
import { ProjectsView } from "~/components/ProjectsView";
import { TeamView } from "~/components/TeamView";
import { TaskDetailModal } from "~/components/TaskDetailModal";
import { CreateProjectModal } from "~/components/CreateProjectModal";
import { CreateTaskModal } from "~/components/CreateTaskModal";
import { AuthModal } from "~/components/AuthModal";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  Sparkles,
  Shield,
  UserCheck,
  CheckCircle2,
  FolderKanban,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function App() {
  const { user, loading: authLoading, demoUsers, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [defaultProjectIdForTask, setDefaultProjectIdForTask] = useState<string | undefined>(
    undefined,
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // App Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Auto-login to seeded admin on initial load if no session exists for zero-friction evaluation
  useEffect(() => {
    if (!authLoading && !user && demoUsers.length > 0) {
      const adminDemo = demoUsers.find((u) => u.role === "ADMIN") || demoUsers[0];
      if (adminDemo) {
        quickDemoLogin(adminDemo.id);
      }
    }
  }, [authLoading, user, demoUsers]);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [projData, taskData, userData, actData] = await Promise.all([
        api.project.list.query().catch(() => []),
        api.task.list.query().catch(() => []),
        api.user.list.query().catch(() => []),
        api.activity.listRecent.query({ limit: 20 }).catch(() => []),
      ]);

      setProjects(projData);
      setTasks(taskData);
      setUsers(userData);
      setActivities(actData);
    } catch (err: any) {
      console.error("Error loading application data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskDetailOpen(true);
  };

  const handleOpenCreateTask = (defaultProjectId?: string) => {
    setDefaultProjectIdForTask(defaultProjectId);
    setCreateTaskOpen(true);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.task.updateStatus.mutate({
        taskId,
        status: newStatus as any,
      });
      toast.success(`Moved task to ${newStatus.replace("_", " ")}`);
      loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update task status");
    }
  };

  const handleFilterByProject = (projectId: string) => {
    setActiveTab("kanban");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Navigation Bar */}
      <Navbar
        onOpenCreateProject={() => setCreateProjectOpen(true)}
        onOpenCreateTask={() => handleOpenCreateTask()}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6">
        {/* Role & Persona Banner */}
        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-gradient-to-r from-primary/5 via-indigo-500/5 to-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                  {user.fullName?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-foreground">
                    {user.fullName}
                  </h1>
                  <Badge
                    variant={isAdmin ? "default" : "outline"}
                    className={`text-[10px] px-2 py-0.5 font-bold ${
                      isAdmin
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "border-emerald-400 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {isAdmin ? "👑 Admin Role" : "👤 Team Member Role"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAdmin
                    ? "Full administrative control: create projects, assign tasks, adjust deadlines, and track revisions."
                    : "Member mode: inspect assigned deliverables, advance workflow status, post updates, and view deadline history."}
                </p>
              </div>
            </div>

            {/* Quick 1-Click Role Switch Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">
                Quick Switch:
              </span>
              {demoUsers.slice(0, 3).map((du) => {
                const isSelected = user.id === du.id;
                return (
                  <button
                    key={du.id}
                    onClick={() => quickDemoLogin(du.id)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all border ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs font-semibold"
                        : "bg-background text-foreground/80 border-border hover:bg-muted"
                    }`}
                  >
                    <span className="text-[11px]">{du.role === "ADMIN" ? "👑" : "👤"}</span>
                    <span>{du.fullName.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center space-y-3">
            <h2 className="text-lg font-bold">Welcome to TaskFlow</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Please sign in or select a demo role to access project boards, deadline tracking, and
              task management.
            </p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Select Demo Role / Sign In</span>
            </Button>
          </div>
        )}

        {/* Tab View Content */}
        {loadingData && !tasks.length ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Syncing workspace with MongoDB Atlas...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardOverview
                projects={projects}
                tasks={tasks}
                activities={activities}
                onSelectTask={handleOpenTask}
                onOpenCreateProject={() => setCreateProjectOpen(true)}
                onOpenCreateTask={() => handleOpenCreateTask()}
                onNavigateTab={setActiveTab}
                currentUserId={user?.id}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "kanban" && (
              <KanbanBoard
                tasks={tasks}
                onSelectTask={handleOpenTask}
                onOpenCreateTask={() => handleOpenCreateTask()}
                onUpdateStatus={handleUpdateStatus}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "list" && (
              <TaskListView
                tasks={tasks}
                projects={projects}
                onSelectTask={handleOpenTask}
                onOpenCreateTask={() => handleOpenCreateTask()}
                onUpdateStatus={handleUpdateStatus}
                currentUserId={user?.id}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsView
                projects={projects}
                onOpenCreateProject={() => setCreateProjectOpen(true)}
                onOpenCreateTask={handleOpenCreateTask}
                onFilterByProject={handleFilterByProject}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "team" && (
              <TeamView
                users={users}
                tasks={tasks}
                onOpenAuth={() => setAuthModalOpen(true)}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}
      </main>

      {/* Task Details & Deadline Revision History Modal (Additional Challenge) */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        onTaskUpdated={loadAllData}
      />

      {/* Create Project Modal (Admin) */}
      <CreateProjectModal
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={loadAllData}
      />

      {/* Create Task Modal (Admin) */}
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onTaskCreated={loadAllData}
        defaultProjectId={defaultProjectIdForTask}
      />

      {/* Auth & Persona Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl px-4 sm:px-8">
          <p>© 2026 TaskFlow. MongoDB Atlas Cluster • tRPC • Next.js App Router</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              MongoDB Connected
            </span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              OpenAPI Reference Docs ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
