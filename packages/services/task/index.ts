import mongoose from "mongoose";
import { connectDB, TaskModel, ActivityModel, CommentModel } from "@repo/database";
import { z } from "zod";

export const createTaskInput = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().default(""),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).default("TODO"),
  deadline: z.string().or(z.date()),
  estimatedHours: z.number().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateTaskInputType = z.infer<typeof createTaskInput>;

export const updateTaskStatusInput = z.object({
  taskId: z.string(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]),
});

export const updateTaskDeadlineInput = z.object({
  taskId: z.string(),
  newDeadline: z.string().or(z.date()),
  reason: z.string().optional().default(""),
});

export const updateTaskInput = z.object({
  taskId: z.string(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
  estimatedHours: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export class TaskService {
  public async createTask(payload: CreateTaskInputType, creatorId: string, creatorName: string) {
    await connectDB();
    const validated = await createTaskInput.parseAsync(payload);

    const deadlineDate = new Date(validated.deadline);

    const task = await TaskModel.create({
      title: validated.title,
      description: validated.description,
      projectId: new mongoose.Types.ObjectId(validated.projectId),
      assigneeId: validated.assigneeId ? new mongoose.Types.ObjectId(validated.assigneeId) : null,
      creatorId: new mongoose.Types.ObjectId(creatorId),
      priority: validated.priority,
      status: validated.status,
      deadline: deadlineDate,
      deadlineHistory: [],
      estimatedHours: validated.estimatedHours || 0,
      tags: validated.tags || [],
    });

    await ActivityModel.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: new mongoose.Types.ObjectId(creatorId),
      userName: creatorName,
      type: "TASK_CREATED",
      details: `Task "${task.title}" was created with priority ${task.priority}`,
      metadata: { priority: task.priority, status: task.status, deadline: deadlineDate },
    });

    return task;
  }

  public async listTasks(filters?: {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    await connectDB();
    const query: any = {};

    if (filters?.projectId) {
      query.projectId = new mongoose.Types.ObjectId(filters.projectId);
    }
    if (filters?.assigneeId) {
      query.assigneeId = new mongoose.Types.ObjectId(filters.assigneeId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.priority) {
      query.priority = filters.priority;
    }
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    const tasks = await TaskModel.find(query)
      .populate("projectId", "name color status")
      .populate("assigneeId", "fullName email avatarUrl role jobTitle")
      .populate("creatorId", "fullName email avatarUrl")
      .populate("deadlineHistory.changedBy", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    return tasks;
  }

  public async getTaskById(taskId: string) {
    await connectDB();
    const task = await TaskModel.findById(taskId)
      .populate("projectId", "name color status")
      .populate("assigneeId", "fullName email avatarUrl role jobTitle")
      .populate("creatorId", "fullName email avatarUrl")
      .populate("deadlineHistory.changedBy", "fullName email avatarUrl");

    if (!task) throw new Error("Task not found");

    const comments = await CommentModel.find({ taskId: task._id })
      .populate("authorId", "fullName email avatarUrl role jobTitle")
      .sort({ createdAt: 1 });

    const activities = await ActivityModel.find({ taskId: task._id })
      .populate("userId", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    return {
      task: task.toJSON(),
      comments,
      activities,
    };
  }

  /**
   * Update task status (Admin or Assigned Team Member)
   */
  public async updateTaskStatus(
    taskId: string,
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED",
    userId: string,
    userName: string,
  ) {
    await connectDB();
    const task = await TaskModel.findById(taskId);
    if (!task) throw new Error("Task not found");

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await ActivityModel.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      type: "STATUS_CHANGED",
      details: `Status updated from ${oldStatus.replace("_", " ")} to ${status.replace("_", " ")}`,
      metadata: { from: oldStatus, to: status },
    });

    return task;
  }

  /**
   * Additional Challenge: Update task deadline with complete historical audit trail
   */
  public async updateTaskDeadline(
    taskId: string,
    newDeadlineDate: Date | string,
    reason: string,
    userId: string,
    userName: string,
  ) {
    await connectDB();
    const task = await TaskModel.findById(taskId);
    if (!task) throw new Error("Task not found");

    const previousDeadline = task.deadline;
    const parsedNewDeadline = new Date(newDeadlineDate);

    // Append to deadline history
    task.deadlineHistory.push({
      previousDeadline,
      newDeadline: parsedNewDeadline,
      changedBy: new mongoose.Types.ObjectId(userId),
      changedByName: userName,
      changedAt: new Date(),
      reason: reason || "Deadline updated by admin",
    });

    task.deadline = parsedNewDeadline;
    await task.save();

    const formattedOld = previousDeadline
      ? new Date(previousDeadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "None";
    const formattedNew = parsedNewDeadline.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    await ActivityModel.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      type: "DEADLINE_CHANGED",
      details: `Deadline revised from ${formattedOld} to ${formattedNew}${
        reason ? ` (Reason: "${reason}")` : ""
      }`,
      metadata: {
        previousDeadline,
        newDeadline: parsedNewDeadline,
        reason,
      },
    });

    return task;
  }

  public async updateTaskDetails(
    payload: z.infer<typeof updateTaskInput>,
    userId: string,
    userName: string,
  ) {
    await connectDB();
    const task = await TaskModel.findById(payload.taskId);
    if (!task) throw new Error("Task not found");

    if (payload.title) task.title = payload.title;
    if (payload.description !== undefined) task.description = payload.description;
    if (payload.projectId) task.projectId = new mongoose.Types.ObjectId(payload.projectId);
    if (payload.assigneeId !== undefined) {
      task.assigneeId = payload.assigneeId ? new mongoose.Types.ObjectId(payload.assigneeId) : null;
    }
    if (payload.priority) task.priority = payload.priority;
    if (payload.status) task.status = payload.status;
    if (payload.estimatedHours !== undefined) task.estimatedHours = payload.estimatedHours;
    if (payload.tags) task.tags = payload.tags;

    await task.save();

    await ActivityModel.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      type: "PRIORITY_CHANGED",
      details: `Task details were updated by ${userName}`,
    });

    return task;
  }

  public async deleteTask(taskId: string) {
    await connectDB();
    await TaskModel.findByIdAndDelete(taskId);
    await CommentModel.deleteMany({ taskId: new mongoose.Types.ObjectId(taskId) });
    await ActivityModel.deleteMany({ taskId: new mongoose.Types.ObjectId(taskId) });
    return { success: true };
  }
}

export const taskService = new TaskService();
