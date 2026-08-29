import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const loginWithEmailAndPasswordInput = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginWithEmailAndPasswordInputType = z.infer<typeof loginWithEmailAndPasswordInput>;

export const generateUserTokenPayload = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "MEMBER"]),
  email: z.string().email(),
  fullName: z.string(),
});

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;
