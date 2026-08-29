
import { userService } from "../../services";

import { publicProcedure, router } from "../../trpc";
import { setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel } from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
 createUserWithEmailAndPassword: publicProcedure
 .meta({ openapi: { method: "POST", path: getPath("/register"), tags: TAGS } })
 .input(createUserWithEmailAndPasswordInputModel)
 .output(createUserWithEmailAndPasswordOutputModel)
 .mutation(async ({ input, ctx }) => {

     const {fullName, email, password} = input;


      const {id, token} =  await userService.createUserWithEmailAndPassword({fullName, email, password})

     setAuthenticationCookie(ctx, token)

     return {id}

 })
});
