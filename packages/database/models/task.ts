import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeadlineHistory {
  previousDeadline: Date | null;
  newDeadline: Date;
  changedBy: mongoose.Types.ObjectId;
  changedByName?: string;
  changedAt: Date;
  reason?: string;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId | null;
  creatorId: mongoose.Types.ObjectId;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  deadline: Date;
  deadlineHistory: IDeadlineHistory[];
  estimatedHours: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DeadlineHistorySchema = new Schema<IDeadlineHistory>(
  {
    previousDeadline: { type: Date, default: null },
    newDeadline: { type: Date, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", required: true },
    changedByName: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
  },
  { _id: false },
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: "TaskFlowProject", required: true, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", default: null, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", required: true },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
      index: true,
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"],
      default: "TODO",
      index: true,
    },
    deadline: { type: Date, required: true, index: true },
    deadlineHistory: { type: [DeadlineHistorySchema], default: [] },
    estimatedHours: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    collection: "taskflow_tasks",
  },
);

TaskSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

TaskSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const TaskModel: Model<ITask> =
  mongoose.models.TaskFlowTask || mongoose.model<ITask>("TaskFlowTask", TaskSchema);
