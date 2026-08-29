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
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { FolderPlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const COLOR_OPTIONS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Purple", value: "#a855f7" },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Set default target end date to 30 days from now
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setTargetEndDate(defaultDate.toISOString().split("T")[0] || "");

      // Load workspace team members
      api.user.list
        .query()
        .then((users) => {
          setUsersList(users);
        })
        .catch(() => {});
    }
  }, [open]);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetEndDate) return;

    setLoading(true);
    try {
      await api.project.create.mutate({
        name: name.trim(),
        description: description.trim(),
        color,
        targetEndDate: new Date(targetEndDate).toISOString(),
        memberIds: selectedMemberIds,
      });

      toast.success(`Project "${name}" created successfully!`);
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      onOpenChange(false);
      onProjectCreated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
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
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
                style={{ backgroundColor: color }}
              >
                <FolderPlus className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Set up a high-level initiative, assign team members, and define deliverable
              milestones.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name" className="text-xs font-semibold">
              Project Name
            </Label>
            <Input
              id="proj-name"
              placeholder="e.g. Next-Gen Mobile App Overhaul"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-semibold">
              Description & Objectives
            </Label>
            <Textarea
              id="proj-desc"
              placeholder="Outline project goals, requirements, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Accent Color</Label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: c.value }}
                  >
                    {color === c.value && (
                      <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-end-date" className="text-xs font-semibold">
                Target Delivery Date
              </Label>
              <Input
                id="proj-end-date"
                type="date"
                required
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Member assignment */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold">Assign Team Members</Label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border rounded-lg p-2 bg-muted/20">
              {usersList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Loading team members...
                </p>
              ) : (
                usersList.map((u: any) => {
                  const uid = u._id || u.id;
                  const isSelected = selectedMemberIds.includes(uid);
                  return (
                    <div
                      key={uid}
                      onClick={() => toggleMember(uid)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={u.avatarUrl} />
                          <AvatarFallback className="text-[10px]">
                            {u.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">{u.fullName}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            ({u.role === "ADMIN" ? "Admin" : "Member"})
                          </span>
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary text-white" : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
                <FolderPlus className="h-3.5 w-3.5" />
              )}
              <span>Create Project</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
