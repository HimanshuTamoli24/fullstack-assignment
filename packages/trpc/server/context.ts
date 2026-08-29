import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { env } from "@repo/env";
import { createCookieFactory, clearCookieFactory, getCookieFactory } from "./utils/cookie";

export interface AuthUser {
  id: string;
  email: string;
}

export interface TRPCContext {
  user: AuthUser | null;
  createCookie: ReturnType<typeof createCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  let user: AuthUser | null = null;

  // Read JWT from Authorization: Bearer <token> header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    // Use service-role key so this client can verify any user's JWT
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user?.email) {
      user = {
        id: data.user.id,
        email: data.user.email,
      };
    }
  }

  return {
    user,
    createCookie: createCookieFactory(res),
    clearCookie: clearCookieFactory(res),
    getCookie: getCookieFactory(req),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
