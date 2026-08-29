import { z } from "zod";
import { commentService, addCommentInput } from "@repo/services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Comments"];
const getPath = generatePath("/comments");

export const commentRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath(""), tags: TAGS } })
    .input(addCommentInput)
    .mutation(async ({ input, ctx }) => {
      return commentService.addComment(input, ctx.user!.id, ctx.user!.fullName);
    }),

  listByTask: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/task/:taskId"), tags: TAGS } })
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      return commentService.getCommentsByTask(input.taskId);
    }),
});
