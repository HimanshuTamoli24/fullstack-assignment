import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import z from "zod";

function findEnvFile(startPath: string): string | undefined {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    const envPath = path.join(currentPath, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return undefined;
}

const envPath = findEnvFile(process.cwd());
if (envPath) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI environment variable is required"),
  DATABASE_URL: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "prod", "test"]).default("development"),
  LOGGER_LEVEL: z.enum(["error", "info", "debug"]).optional(),
  PORT: z.string().optional().default("8000"),
  BASE_URL: z.string().url().default("http://localhost:8000"),

  NEXT_PUBLIC_API_URL: z.string().url().optional().default("http://localhost:8000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),

  JWT_SECRET: z.string().default("taskflow-super-secret-jwt-key-2026"),
  JWT_REFRESH_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => {
    const key = issue.path.join(".");
    return `• ${key}: ${issue.message}`;
  });

  throw new Error(`❌ Environment validation failed\n\n${errors.join("\n")}`);
}

export const env = parsed.data;
