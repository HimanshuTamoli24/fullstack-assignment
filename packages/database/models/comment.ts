import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "TaskFlowTask", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", required: true },
    content: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    collection: "taskflow_comments",
  },
);

CommentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

CommentSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const CommentModel: Model<IComment> =
  mongoose.models.TaskFlowComment || mongoose.model<IComment>("TaskFlowComment", CommentSchema);
