import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  color: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  ownerId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  startDate: Date;
  targetEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    color: { type: String, default: "#6366f1" },
    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"],
      default: "ACTIVE",
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "TaskFlowUser", required: true, index: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "TaskFlowUser" }],
    startDate: { type: Date, default: Date.now },
    targetEndDate: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: "taskflow_projects",
  },
);

ProjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ProjectSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const ProjectModel: Model<IProject> =
  mongoose.models.TaskFlowProject || mongoose.model<IProject>("TaskFlowProject", ProjectSchema);
