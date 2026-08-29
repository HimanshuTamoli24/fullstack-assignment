import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  salt?: string;
  role: "ADMIN" | "MEMBER";
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER", index: true },
    avatarUrl: { type: String, default: "" },
    jobTitle: { type: String, default: "Team Member" },
    department: { type: String, default: "Engineering" },
  },
  {
    timestamps: true,
    collection: "taskflow_users",
  },
);

// Virtual for id string
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret: any) => {
    delete ret.__v;
    delete ret.password;
    delete ret.salt;
    return ret;
  },
});

export const UserModel: Model<IUser> =
  mongoose.models.TaskFlowUser || mongoose.model<IUser>("TaskFlowUser", UserSchema);
