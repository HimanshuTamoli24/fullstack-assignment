import { publicProcedure, router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { userRouter } from "./routes/user/route";
import z from "zod";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  test: publicProcedure
    .meta({ openapi: { method: "GET", path: "/test" } })
    .input(z.object({ name: z.string() }))
    .output(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return {
        name: input.name,
      };
    }),
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
