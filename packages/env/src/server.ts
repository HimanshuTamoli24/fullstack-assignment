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
  DATABASE_URL: z.string().min(1),

  // CLOUDINARY_CLOUD_NAME: z.string().min(1),
  // CLOUDINARY_API_KEY: z.string().min(1),
  // CLOUDINARY_API_SECRET: z.string().min(1),

  // RESEND_API_KEY: z.string().min(1),

  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1),

  NODE_ENV: z.enum(["development", "production", "prod", "test"]).default("development"),

  LOGGER_LEVEL: z.enum(["error", "info", "debug"]).optional(),

  PORT: z.string().optional(),

  BASE_URL: z.string().url().default("http://localhost:8000"),

  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),

  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().min(1),

  JWT_SECRET: z.string().describe("secret used to sign jwt tokens").optional(),
  JWT_REFRESH_SECRET: z.string().describe("secret used to sign refresh tokens").optional(),

  // SMS_ACCOUNT_SID: z.string(),
  // SMS_AUTH_TOKEN: z.string(),
  // SMS_VERIFY_SID: z.string(),

  // RAZORPAY_KEY_ID: z.string().optional(),
  // RAZORPAY_KEY_SECRET: z.string().optional(),
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
