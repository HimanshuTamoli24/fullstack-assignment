import { z } from "zod";
import { userService } from "@repo/services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Users"];
const getPath = generatePath("/users");

export const userRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(z.void())
    .query(async () => {
      const users = await userService.listAllUsers();
      return users;
    }),
});
