"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { PlusCircle, Loader2, Calendar, Tag, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  defaultProjectId?: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onTaskCreated,
  defaultProjectId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [tagsString, setTagsString] = useState("");

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Set default deadline to 7 days from now
      const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setDeadline(defaultDate.toISOString().split("T")[0] || "");

      // Fetch projects and users
      Promise.all([api.project.list.query(), api.user.list.query()])
        .then(([projList, userList]) => {
          setProjects(projList);
          setUsers(userList);
          if (!projectId && projList && projList.length > 0 && projList[0]) {
            const firstProj = projList[0] as any;
            setProjectId(firstProj._id?.toString() || firstProj.id?.toString() || "");
          }
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || !deadline) return;

    setLoading(true);
    try {
      const tags = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.task.create.mutate({
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeId: assigneeId || undefined,
        priority,
        deadline: new Date(deadline).toISOString(),
        estimatedHours: Number(estimatedHours) || 0,
        tags,
      });

      toast.success(`Task "${title}" created and assigned!`);
      setTitle("");
      setDescription("");
      setTagsString("");
      onOpenChange(false);
      onTaskCreated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/70 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 p-6 pb-4 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <PlusCircle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Specify task deliverables, assign a team member, set priority, and schedule the
              initial deadline.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="task-title" className="text-xs font-semibold">
              Task Title
            </Label>
            <Input
              id="task-title"
              placeholder="e.g. Implement OAuth 2.0 PKCE authentication flow"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="task-desc" className="text-xs font-semibold">
              Description & Acceptance Criteria
            </Label>
            <Textarea
              id="task-desc"
              placeholder="Describe requirements, acceptance criteria, dependencies..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id || p.id} value={p._id || p.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: p.color || "#6366f1" }}
                        />
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Assign team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u._id || u.id} value={u._id || u.id}>
                      {u.fullName} ({u.role === "ADMIN" ? "Admin" : "Member"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">☕ Low</SelectItem>
                  <SelectItem value="MEDIUM">🔹 Medium</SelectItem>
                  <SelectItem value="HIGH">⚡ High</SelectItem>
                  <SelectItem value="URGENT">🚨 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <Label htmlFor="task-deadline" className="text-xs font-semibold">
                Target Deadline
              </Label>
              <Input
                id="task-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1">
              <Label htmlFor="task-hours" className="text-xs font-semibold">
                Est. Hours
              </Label>
              <Input
                id="task-hours"
                type="number"
                min="1"
                max="200"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="task-tags" className="text-xs font-semibold">
              Tags (comma separated)
            </Label>
            <Input
              id="task-tags"
              placeholder="e.g. Backend, Security, Database"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="text-xs font-semibold gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlusCircle className="h-3.5 w-3.5" />
              )}
              <span>Create Task</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
