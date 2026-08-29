import { z } from "zod";
import { userService } from "@repo/services";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { setAuthenticationCookie, clearAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

export const authRouter = router({
  register: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/register"), tags: TAGS } })
    .input(
      z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await userService.createUserWithEmailAndPassword(input);
      setAuthenticationCookie(ctx, token);
      return { user, token };
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await userService.loginWithEmailAndPassword(input);
      setAuthenticationCookie(ctx, token);
      return { user, token };
    }),

  getMe: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(z.void())
    .query(async ({ ctx }) => {
      if (!ctx.user) return null;
      const user = await userService.getUserById(ctx.user.id);
      return user;
    }),

  getDemoUsers: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/demo-users"), tags: TAGS } })
    .input(z.void())
    .query(async () => {
      const demoUsers = await userService.getQuickDemoUsers();
      return demoUsers;
    }),

  quickDemoLogin: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/quick-demo-login"), tags: TAGS } })
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await userService.getUserById(input.userId);
      if (!user) throw new Error("Demo user not found");

      const { token } = await userService.generateUserToken({
        userId: user._id.toHexString(),
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      });

      setAuthenticationCookie(ctx, token);
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
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(z.void())
    .mutation(async ({ ctx }) => {
      clearAuthenticationCookie(ctx);
      return { success: true };
    }),
});
