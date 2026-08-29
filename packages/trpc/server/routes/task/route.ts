import { z } from "zod";
import {
  taskService,
  createTaskInput,
  updateTaskStatusInput,
  updateTaskDeadlineInput,
  updateTaskInput,
} from "@repo/services";
import { protectedProcedure, adminProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Tasks"];
const getPath = generatePath("/tasks");

export const taskRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(
      z
        .object({
          projectId: z.string().optional(),
          assigneeId: z.string().optional(),
          status: z.string().optional(),
          priority: z.string().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const tasks = await taskService.listTasks(input);
      return tasks;
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/:id"), tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return taskService.getTaskById(input.id);
    }),

  create: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath(""), tags: TAGS } })
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      return taskService.createTask(input, ctx.user!.id, ctx.user!.fullName);
    }),

  updateStatus: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/:taskId/status"), tags: TAGS } })
    .input(updateTaskStatusInput)
    .mutation(async ({ input, ctx }) => {
      return taskService.updateTaskStatus(
        input.taskId,
        input.status,
        ctx.user!.id,
        ctx.user!.fullName,
      );
    }),

  /**
   * Additional Challenge: Deadline revision with audit history
   */
  updateDeadline: adminProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/:taskId/deadline"), tags: TAGS } })
    .input(updateTaskDeadlineInput)
    .mutation(async ({ input, ctx }) => {
      return taskService.updateTaskDeadline(
        input.taskId,
        input.newDeadline,
        input.reason || "",
        ctx.user!.id,
        ctx.user!.fullName,
      );
    }),

  updateDetails: adminProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/:taskId/details"), tags: TAGS } })
    .input(updateTaskInput)
    .mutation(async ({ input, ctx }) => {
      return taskService.updateTaskDetails(input, ctx.user!.id, ctx.user!.fullName);
    }),

  delete: adminProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/:taskId"), tags: TAGS } })
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      return taskService.deleteTask(input.taskId);
    }),
});
