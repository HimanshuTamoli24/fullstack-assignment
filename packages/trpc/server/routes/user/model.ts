import { z } from "zod";

// Output: full profile
export const userProfileOutput = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  plan: z.string(),
  credits: z.number(),
  onboardingCompleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input: updateProfile
export const updateProfileInput = z.object({
  fullName: z.string().max(80).optional(),
  profileImageUrl: z.string().url().optional(),
});

// Output: plan info
export const planOutput = z.object({
  plan: z.string(),
  credits: z.number(),
});

export type UserProfile = z.infer<typeof userProfileOutput>;
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
