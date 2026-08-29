import { z } from "zod";

export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

export const frontendEnv = env;
