import { createHmac, randomBytes } from "node:crypto";
import * as JWT from "jsonwebtoken";
import { connectDB, UserModel } from "@repo/database";
import { env } from "@repo/env";
import {
  createUserWithEmailAndPasswordInput,
  loginWithEmailAndPasswordInput,
  generateUserTokenPayload,
  type CreateUserWithEmailAndPasswordInputType,
  type LoginWithEmailAndPasswordInputType,
  type GenerateUserTokenPayloadType,
} from "./model";

export class UserService {
  private hashPassword(password: string, salt: string): string {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  public async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const validated = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign(validated, env.JWT_SECRET || "taskflow-super-secret-jwt-key-2026", {
      expiresIn: "7d",
    });
    return { token };
  }

  public async verifyToken(token: string) {
    try {
      const decoded = JWT.verify(token, env.JWT_SECRET || "taskflow-super-secret-jwt-key-2026") as {
        userId: string;
        role: "ADMIN" | "MEMBER";
        email: string;
        fullName: string;
      };
      return decoded;
    } catch {
      return null;
    }
  }

  public async getUserByEmail(email: string) {
    await connectDB();
    return UserModel.findOne({ email: email.toLowerCase().trim() });
  }

  public async getUserById(id: string) {
    await connectDB();
    return UserModel.findById(id).select("-password -salt");
  }

  public async listAllUsers() {
    await connectDB();
    return UserModel.find({}).select("-password -salt").sort({ createdAt: -1 });
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    await connectDB();
    const validated = await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existing = await this.getUserByEmail(validated.email);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const salt = randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword(validated.password, salt);

    const user = await UserModel.create({
      fullName: validated.fullName,
      email: validated.email.toLowerCase().trim(),
      password: passwordHash,
      salt,
      role: validated.role || "MEMBER",
      jobTitle: validated.jobTitle || "Team Member",
      department: validated.department || "Engineering",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(validated.fullName)}`,
    });

    const { token } = await this.generateUserToken({
      userId: user._id.toHexString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user._id.toHexString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        department: user.department,
      },
      token,
    };
  }

  public async loginWithEmailAndPassword(payload: LoginWithEmailAndPasswordInputType) {
    await connectDB();
    const validated = await loginWithEmailAndPasswordInput.parseAsync(payload);

    const user = await this.getUserByEmail(validated.email);
    if (!user || !user.salt || !user.password) {
      throw new Error("Invalid email or password.");
    }

    const computedHash = this.hashPassword(validated.password, user.salt);
    if (computedHash !== user.password) {
      throw new Error("Invalid email or password.");
    }

    const { token } = await this.generateUserToken({
      userId: user._id.toHexString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user._id.toHexString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        department: user.department,
      },
      token,
    };
  }

  public async getQuickDemoUsers() {
    await connectDB();
    const users = await UserModel.find({}).select("-password -salt").limit(10);
    return users.map((u) => ({
      id: u._id.toHexString(),
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      jobTitle: u.jobTitle,
      avatarUrl: u.avatarUrl,
    }));
  }
}

export const userService = new UserService();
