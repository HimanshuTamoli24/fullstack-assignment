import mongoose from "mongoose";
import { connectDB, CommentModel, TaskModel, ActivityModel } from "@repo/database";
import { z } from "zod";

export const addCommentInput = z.object({
  taskId: z.string().min(1),
  content: z.string().min(1, "Comment content cannot be empty"),
});

export type AddCommentInputType = z.infer<typeof addCommentInput>;

export class CommentService {
  public async addComment(payload: AddCommentInputType, authorId: string, authorName: string) {
    await connectDB();
    const validated = await addCommentInput.parseAsync(payload);

    const task = await TaskModel.findById(validated.taskId);
    if (!task) throw new Error("Task not found");

    const comment = await CommentModel.create({
      taskId: new mongoose.Types.ObjectId(validated.taskId),
      authorId: new mongoose.Types.ObjectId(authorId),
      content: validated.content,
    });

    await ActivityModel.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: new mongoose.Types.ObjectId(authorId),
      userName: authorName,
      type: "COMMENT_ADDED",
      details: `${authorName} posted a comment/progress update on "${task.title}"`,
    });

    const populated = await CommentModel.findById(comment._id).populate(
      "authorId",
      "fullName email avatarUrl role jobTitle",
    );

    return populated;
  }

  public async getCommentsByTask(taskId: string) {
    await connectDB();
    return CommentModel.find({ taskId: new mongoose.Types.ObjectId(taskId) })
      .populate("authorId", "fullName email avatarUrl role jobTitle")
      .sort({ createdAt: 1 });
  }
}

export const commentService = new CommentService();
