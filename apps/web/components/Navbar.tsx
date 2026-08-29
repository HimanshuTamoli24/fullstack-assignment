"use client";

import React, { useState } from "react";
import { useAuth } from "~/context/auth-context";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Plus,
  ShieldAlert,
  Users,
  LogOut,
  Sparkles,
  FolderKanban,
  CheckCircle2,
  ChevronDown,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({
  onOpenCreateProject,
  onOpenCreateTask,
  onOpenAuth,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const { user, logout, demoUsers, quickDemoLogin } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveTab("dashboard")}
            className="flex cursor-pointer items-center gap-2.5 font-bold text-xl tracking-tight transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 shadow-md shadow-primary/25 text-white">
              <FolderKanban className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent font-extrabold text-lg">
              TaskFlow
            </span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              Mongo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "kanban"
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "projects"
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "team"
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Team
            </button>
          </nav>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Switch Role / User</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Instant 1-Click Persona Login
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {demoUsers.map((du) => (
                <DropdownMenuItem
                  key={du.id}
                  onClick={() => quickDemoLogin(du.id)}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={du.avatarUrl} />
                      <AvatarFallback className="text-[10px]">
                        {du.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium leading-tight">{du.fullName}</span>
                      <span className="text-[10px] text-muted-foreground">{du.jobTitle}</span>
                    </div>
                  </div>
                  <Badge
                    variant={du.role === "ADMIN" ? "default" : "secondary"}
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    {du.role === "ADMIN" ? "Admin" : "Member"}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Action Buttons */}
          {user && isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onOpenCreateProject}
                variant="outline"
                size="sm"
                className="hidden lg:flex items-center gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </Button>
              <Button
                onClick={onOpenCreateTask}
                size="sm"
                className="flex items-center gap-1 text-xs shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Task</span>
              </Button>
            </div>
          )}

          {/* User Profile or Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full p-1 pl-2 border border-border/80 bg-background/80 hover:bg-muted transition-colors focus:outline-none">
                  <div className="hidden text-right sm:block">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold leading-none">{user.fullName}</p>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "outline"}
                        className={`text-[9px] px-1.5 py-0 h-4 ${
                          user.role === "ADMIN"
                            ? "bg-indigo-600 text-white"
                            : "border-emerald-500/40 text-emerald-600 bg-emerald-50/50"
                        }`}
                      >
                        {user.role === "ADMIN" ? "👑 Admin" : "👤 Member"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{user.email}</p>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user.fullName?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        Role: {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setActiveTab("list")}
                  className="cursor-pointer text-xs"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>My Assigned Tasks</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveTab("team")}
                  className="cursor-pointer text-xs"
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Team Directory</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-xs text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onOpenAuth} size="sm" className="text-xs font-semibold">
              Sign In / Demo
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
