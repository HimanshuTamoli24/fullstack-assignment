import mongoose from "mongoose";
import { connectDB, ActivityModel } from "@repo/database";

export class ActivityService {
  public async getRecentActivities(limit = 20) {
    await connectDB();
    return ActivityModel.find({})
      .populate("userId", "fullName email avatarUrl role")
      .populate("taskId", "title priority status")
      .populate("projectId", "name color")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  public async getActivitiesByTask(taskId: string) {
    await connectDB();
    return ActivityModel.find({ taskId: new mongoose.Types.ObjectId(taskId) })
      .populate("userId", "fullName email avatarUrl role")
      .sort({ createdAt: -1 });
  }

  public async getActivitiesByProject(projectId: string) {
    await connectDB();
    return ActivityModel.find({ projectId: new mongoose.Types.ObjectId(projectId) })
      .populate("userId", "fullName email avatarUrl role")
      .populate("taskId", "title")
      .sort({ createdAt: -1 });
  }
}

export const activityService = new ActivityService();
