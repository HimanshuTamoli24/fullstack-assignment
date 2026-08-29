import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { userService } from "@repo/services";
import { createCookieFactory, clearCookieFactory, getCookieFactory } from "./utils/cookie";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  fullName: string;
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

  // Read JWT from Authorization: Bearer <token> header or cookie
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = req.cookies?.["taskflow_token"] || req.cookies?.["auth_token"];
  const token = headerToken || cookieToken;

  if (token) {
    const verified = await userService.verifyToken(token);
    if (verified) {
      user = {
        id: verified.userId,
        email: verified.email,
        role: verified.role,
        fullName: verified.fullName,
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
