import { z } from "zod";
import { projectService, createProjectInput } from "@repo/services";
import { protectedProcedure, adminProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Projects"];
const getPath = generatePath("/projects");

export const projectRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const projects = await projectService.listProjects(ctx.user!.id, ctx.user!.role);
      return projects;
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/:id"), tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(z.any())
    .query(async ({ input }) => {
      return projectService.getProjectById(input.id);
    }),

  create: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath(""), tags: TAGS } })
    .input(createProjectInput)
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      return projectService.createProject(input, ctx.user!.id, ctx.user!.fullName);
    }),

  addMember: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/:id/members"), tags: TAGS } })
    .input(
      z.object({
        projectId: z.string(),
        memberId: z.string(),
      }),
    )
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      return projectService.addMemberToProject(
        input.projectId,
        input.memberId,
        ctx.user!.id,
        ctx.user!.fullName,
      );
    }),
});
