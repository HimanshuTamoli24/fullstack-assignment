import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName?: string;
  type:
    | "TASK_CREATED"
    | "STATUS_CHANGED"
    | "ASSIGNED"
    | "DEADLINE_CHANGED"
    | "PRIORITY_CHANGED"
    | "COMMENT_ADDED"
    | "PROJECT_CREATED"
    | "MEMBER_ADDED";
  details: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "TaskFlowTask", index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "TaskFlowProject", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", required: true },
    userName: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: [
        "TASK_CREATED",
        "STATUS_CHANGED",
        "ASSIGNED",
        "DEADLINE_CHANGED",
        "PRIORITY_CHANGED",
        "COMMENT_ADDED",
        "PROJECT_CREATED",
        "MEMBER_ADDED",
      ],
      index: true,
    },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "taskflow_activities",
  },
);

ActivitySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ActivitySchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const ActivityModel: Model<IActivity> =
  mongoose.models.TaskFlowActivity || mongoose.model<IActivity>("TaskFlowActivity", ActivitySchema);
