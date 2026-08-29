import mongoose from "mongoose";
import { connectDB, ProjectModel, TaskModel, ActivityModel } from "@repo/database";
import { z } from "zod";

export const createProjectInput = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional().default(""),
  color: z.string().optional().default("#6366f1"),
  memberIds: z.array(z.string()).optional().default([]),
  startDate: z.string().or(z.date()).optional(),
  targetEndDate: z.string().or(z.date()),
});

export type CreateProjectInputType = z.infer<typeof createProjectInput>;

export class ProjectService {
  public async createProject(payload: CreateProjectInputType, userId: string, userName: string) {
    await connectDB();
    const validated = await createProjectInput.parseAsync(payload);

    const memberObjectIds = Array.from(new Set([userId, ...(validated.memberIds || [])])).map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    const project = await ProjectModel.create({
      name: validated.name,
      description: validated.description,
      color: validated.color,
      ownerId: new mongoose.Types.ObjectId(userId),
      memberIds: memberObjectIds,
      startDate: validated.startDate ? new Date(validated.startDate) : new Date(),
      targetEndDate: new Date(validated.targetEndDate),
      status: "ACTIVE",
    });

    // Record activity
    await ActivityModel.create({
      projectId: project._id,
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      type: "PROJECT_CREATED",
      details: `Project "${project.name}" was created by ${userName}`,
    });

    return project;
  }

  public async listProjects(userId: string, role: "ADMIN" | "MEMBER") {
    await connectDB();
    let query = {};
    if (role !== "ADMIN") {
      query = { memberIds: new mongoose.Types.ObjectId(userId) };
    }

    const projects = await ProjectModel.find(query)
      .populate("ownerId", "fullName email avatarUrl")
      .populate("memberIds", "fullName email avatarUrl role jobTitle")
      .sort({ createdAt: -1 });

    // Enhance projects with task metrics
    const enhancedProjects = await Promise.all(
      projects.map(async (p) => {
        const tasks = await TaskModel.find({ projectId: p._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
        const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
        const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW").length;
        const todoTasks = tasks.filter((t) => t.status === "TODO").length;
        const overdueTasks = tasks.filter(
          (t) => t.status !== "COMPLETED" && new Date(t.deadline).getTime() < Date.now(),
        ).length;

        const progressPercent =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...p.toJSON(),
          metrics: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            inReviewTasks,
            todoTasks,
            overdueTasks,
            progressPercent,
          },
        };
      }),
    );

    return enhancedProjects;
  }

  public async getProjectById(projectId: string) {
    await connectDB();
    const project = await ProjectModel.findById(projectId)
      .populate("ownerId", "fullName email avatarUrl")
      .populate("memberIds", "fullName email avatarUrl role jobTitle");

    if (!project) throw new Error("Project not found");

    const tasks = await TaskModel.find({ projectId: project._id })
      .populate("assigneeId", "fullName email avatarUrl role")
      .sort({ deadline: 1 });

    return {
      project: project.toJSON(),
      tasks,
    };
  }

  public async addMemberToProject(
    projectId: string,
    memberId: string,
    adminId: string,
    adminName: string,
  ) {
    await connectDB();
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new Error("Project not found");

    const memberObjectId = new mongoose.Types.ObjectId(memberId);
    if (!project.memberIds.some((id) => id.equals(memberObjectId))) {
      project.memberIds.push(memberObjectId);
      await project.save();

      await ActivityModel.create({
        projectId: project._id,
        userId: new mongoose.Types.ObjectId(adminId),
        userName: adminName,
        type: "MEMBER_ADDED",
        details: `Member was added to project "${project.name}"`,
      });
    }

    return project;
  }

  public async updateProject(projectId: string, updates: Partial<CreateProjectInputType>) {
    await connectDB();
    const project = await ProjectModel.findByIdAndUpdate(projectId, updates, { new: true });
    if (!project) throw new Error("Project not found");
    return project;
  }
}

export const projectService = new ProjectService();
