"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "~/context/auth-context";
import { api } from "~/trpc/server";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Clock,
  History,
  MessageSquare,
  Activity as ActivityIcon,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  User as UserIcon,
  Sparkles,
  Tag,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailModal({
  taskId,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "comments" | "activity">(
    "overview",
  );

  // Comment input state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Deadline revision state (Admin)
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineReason, setDeadlineReason] = useState("");
  const [updatingDeadline, setUpdatingDeadline] = useState(false);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = (await api.task.getById.query({ id: taskId })) as any;
      setTaskData(data);
      if (data?.task?.deadline) {
        // Format to YYYY-MM-DD for date input
        const d = new Date(data.task.deadline);
        setNewDeadline(d.toISOString().split("T")[0] || "");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load task details");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails();
    }
  }, [open, taskId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!taskId) return;
    setUpdatingStatus(true);
    try {
      await api.task.updateStatus.mutate({
        taskId,
        status: newStatus as any,
      });
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      await fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeadlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newDeadline) return;
    setUpdatingDeadline(true);
    try {
      await api.task.updateDeadline.mutate({
        taskId,
        newDeadline: new Date(newDeadline).toISOString(),
        reason: deadlineReason.trim() || "Deadline modified by project admin",
      });
      toast.success("Task deadline updated & revision recorded in audit history!");
      setIsEditingDeadline(false);
      setDeadlineReason("");
      await fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update deadline");
    } finally {
      setUpdatingDeadline(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.comment.create.mutate({
        taskId,
        content: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment / progress update added!");
      await fetchTaskDetails();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId || !confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.task.delete.mutate({ taskId });
      toast.success("Task deleted successfully");
      onOpenChange(false);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete task");
    }
  };

  if (!open) return null;

  const task = taskData?.task;
  const comments = taskData?.comments || [];
  const activities = taskData?.activities || [];
  const deadlineHistory = task?.deadlineHistory || [];

  const isOverdue =
    task?.deadline && task.status !== "COMPLETED" && new Date(task.deadline).getTime() < Date.now();

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return <Badge className="bg-red-500/15 text-red-700 border-red-200">🚨 Urgent</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-200">⚡ High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200">🔹 Medium</Badge>;
      case "LOW":
        return <Badge className="bg-slate-500/15 text-slate-700 border-slate-200">☕ Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-border/70 shadow-2xl max-h-[90vh] flex flex-col">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading task specifications...</p>
          </div>
        ) : task ? (
          <>
            {/* Header with Project and Status control */}
            <div className="bg-gradient-to-r from-muted/60 via-muted/30 to-background p-6 pb-4 border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: task.projectId?.color || "#6366f1" }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {task.projectId?.name || "Project"}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <Select
                    value={task.status}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="h-8 text-xs font-semibold w-36 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">📋 To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW">👀 In Review</SelectItem>
                      <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteTask}
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <DialogTitle className="text-xl font-bold leading-snug">{task.title}</DialogTitle>

              {/* Deadline & Revision pill alert */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <div
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 border font-medium ${
                    isOverdue
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-background text-foreground border-border"
                  }`}
                >
                  <Calendar
                    className={`h-3.5 w-3.5 ${isOverdue ? "text-red-600" : "text-primary"}`}
                  />
                  <span>Deadline: {format(new Date(task.deadline), "MMM d, yyyy")}</span>
                  {isOverdue && <span className="font-bold text-red-600">(Overdue)</span>}
                </div>

                {deadlineHistory.length > 0 && (
                  <button
                    onClick={() => setActiveTab("history")}
                    className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-800 border border-amber-300/60 font-semibold hover:bg-amber-500/20 transition-colors"
                  >
                    <History className="h-3.5 w-3.5 text-amber-600" />
                    <span>
                      {deadlineHistory.length} Deadline{" "}
                      {deadlineHistory.length === 1 ? "Revision" : "Revisions"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body Tabs */}
            <div className="flex-1 overflow-y-auto p-6 pt-3">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="overview" className="text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs flex items-center gap-1">
                    <History className="h-3 w-3" />
                    <span>Deadlines ({deadlineHistory.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Updates ({comments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">
                    Audit Log
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Task Overview */}
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Description
                    </h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap rounded-lg bg-muted/30 p-3 border border-border/40">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="rounded-lg border border-border/60 p-3 space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Assignee</span>
                      {task.assigneeId ? (
                        <div className="flex items-center gap-2 pt-0.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={task.assigneeId.avatarUrl} />
                            <AvatarFallback className="text-xs font-semibold">
                              {task.assigneeId.fullName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold leading-none">
                              {task.assigneeId.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {task.assigneeId.jobTitle || task.assigneeId.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Unassigned</p>
                      )}
                    </div>

                    <div className="rounded-lg border border-border/60 p-3 space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Estimated Work
                      </span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Timer className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">
                          {task.estimatedHours || 0} Hours
                        </span>
                      </div>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {task.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[11px] font-normal">
                            <Tag className="h-2.5 w-2.5 mr-1 opacity-60" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline Management Section (For Admin) */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          Task Deadline Management
                        </span>
                      </div>
                      {isAdmin && !isEditingDeadline && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingDeadline(true)}
                          className="h-7 text-xs bg-background"
                        >
                          Modify Deadline
                        </Button>
                      )}
                    </div>

                    {isEditingDeadline && isAdmin ? (
                      <form onSubmit={handleDeadlineSubmit} className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="deadline-date" className="text-xs font-semibold">
                              New Target Deadline
                            </Label>
                            <Input
                              id="deadline-date"
                              type="date"
                              required
                              value={newDeadline}
                              onChange={(e) => setNewDeadline(e.target.value)}
                              className="text-xs h-8 bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="deadline-reason" className="text-xs font-semibold">
                              Reason for Adjustment
                            </Label>
                            <Input
                              id="deadline-reason"
                              placeholder="e.g. Scope extension, client review delay"
                              required
                              value={deadlineReason}
                              onChange={(e) => setDeadlineReason(e.target.value)}
                              className="text-xs h-8 bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingDeadline(false)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updatingDeadline}
                            className="h-7 text-xs font-semibold"
                          >
                            {updatingDeadline ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Save & Record Revision
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Current Target:</span>
                        <span className="font-semibold text-foreground">
                          {format(new Date(task.deadline), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 2: THE ADDITIONAL CHALLENGE FEATURE - Deadline Revision History */}
                <TabsContent value="history" className="space-y-4">
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Deadline Audit Trail & Revision History
                    </p>
                    <p className="mt-0.5">
                      Every time a project deadline is modified, a historical snapshot is
                      permanently recorded with previous date, new date, modifier, and reasoning.
                    </p>
                  </div>

                  {deadlineHistory.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl p-6">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">No Deadline Adjustments Yet</p>
                      <p className="mt-1">
                        This task is currently on track with its original deadline (
                        {format(new Date(task.deadline), "MMM d, yyyy")}).
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {deadlineHistory.map((item: any, index: number) => {
                        const prevDate = item.previousDeadline
                          ? new Date(item.previousDeadline)
                          : null;
                        const newDate = new Date(item.newDeadline);
                        const daysDiff = prevDate ? differenceInDays(newDate, prevDate) : 0;

                        return (
                          <div key={index} className="relative">
                            {/* Dot */}
                            <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                              <History className="h-3 w-3" />
                            </div>

                            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-2.5">
                              {/* Header: Dates transition */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 font-semibold text-xs">
                                  <span className="text-muted-foreground line-through">
                                    {prevDate ? format(prevDate, "MMM d, yyyy") : "Initial Date"}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-amber-500" />
                                  <span className="text-foreground bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    {format(newDate, "MMM d, yyyy")}
                                  </span>
                                </div>

                                {daysDiff !== 0 && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      daysDiff > 0
                                        ? "bg-amber-50 text-amber-800 border-amber-300"
                                        : "bg-blue-50 text-blue-800 border-blue-300"
                                    }`}
                                  >
                                    {daysDiff > 0
                                      ? `+${daysDiff} Days Extension`
                                      : `${daysDiff} Days Accelerated`}
                                  </Badge>
                                )}
                              </div>

                              {/* Reason box */}
                              {item.reason && (
                                <div className="rounded-md bg-muted/40 p-2.5 text-xs">
                                  <span className="font-semibold text-muted-foreground text-[11px] block mb-0.5">
                                    Reason for modification:
                                  </span>
                                  <p className="text-foreground italic">"{item.reason}"</p>
                                </div>
                              )}

                              {/* Footer: User and Timestamp */}
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="h-3 w-3 text-primary" />
                                  <span>
                                    Modified by:{" "}
                                    <strong className="text-foreground">
                                      {item.changedByName || item.changedBy?.fullName || "Admin"}
                                    </strong>
                                  </span>
                                </div>
                                <span>
                                  {item.changedAt
                                    ? format(new Date(item.changedAt), "MMM d, yyyy • h:mm a")
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Comments & Progress Updates */}
                <TabsContent value="comments" className="space-y-4">
                  {/* Post Comment Input */}
                  <form onSubmit={handleCommentSubmit} className="space-y-2">
                    <Textarea
                      placeholder="Add a progress update, note, or blocker..."
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="text-xs min-h-[70px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingComment || !commentText.trim()}
                        className="h-8 text-xs font-semibold gap-1.5"
                      >
                        {submittingComment ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>Post Update</span>
                      </Button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-3 pt-2">
                    {comments.length === 0 ? (
                      <p className="text-center py-6 text-xs text-muted-foreground">
                        No comments or progress updates yet. Be the first to share an update!
                      </p>
                    ) : (
                      comments.map((c: any) => (
                        <div
                          key={c._id || c.id}
                          className="rounded-xl border border-border/70 p-3.5 space-y-2 bg-card"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={c.authorId?.avatarUrl} />
                                <AvatarFallback className="text-[10px] font-semibold">
                                  {c.authorId?.fullName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-xs font-semibold">
                                  {c.authorId?.fullName || "User"}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {c.authorId?.jobTitle || c.authorId?.role}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {c.createdAt
                                ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                                : ""}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap pl-8">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Tab 4: Audit Activity Trail */}
                <TabsContent value="activity" className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-center py-6 text-xs text-muted-foreground">
                      No logged activities for this task yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((act: any) => (
                        <div
                          key={act._id || act.id}
                          className="flex items-start gap-3 rounded-lg border border-border/50 p-2.5 text-xs bg-muted/20"
                        >
                          <ActivityIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{act.details}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {act.userName || act.userId?.fullName || "System"} •{" "}
                              {act.createdAt
                                ? format(new Date(act.createdAt), "MMM d, h:mm a")
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
