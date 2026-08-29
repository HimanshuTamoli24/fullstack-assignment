import { z } from "zod";
import { activityService } from "@repo/services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Activities"];
const getPath = generatePath("/activities");

export const activityRouter = router({
  listRecent: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/recent"), tags: TAGS } })
    .input(z.object({ limit: z.number().optional().default(20) }).optional())
    .output(z.array(z.any()))
    .query(async ({ input }) => {
      return activityService.getRecentActivities(input?.limit || 20);
    }),

  listByTask: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/task/:taskId"), tags: TAGS } })
    .input(z.object({ taskId: z.string() }))
    .output(z.array(z.any()))
    .query(async ({ input }) => {
      return activityService.getActivitiesByTask(input.taskId);
    }),
});
