import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import { userService } from "../../services";
import { userProfileOutput, updateProfileInput, planOutput } from "./model";

export const userRouter = router({
  /**
   * user.me — returns the full application profile for the authenticated user.
   * The user id comes from ctx.user (verified Supabase JWT) — never from the frontend.
   * If the row is missing (trigger failure), it auto-creates one from the session data.
   */
  me: protectedProcedure.output(userProfileOutput).query(async ({ ctx }) => {
    try {
      return await userService.getProfile(ctx.user.id, ctx.user.email);
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to get user profile.",
      });
    }
  }),

  /**
   * user.updateProfile — updates fullName and/or profileImageUrl for the authenticated user.
   */
  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .output(userProfileOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await userService.updateProfile(ctx.user.id, input);
      } catch (error: any) {
        throw new TRPCError({ code: "NOT_FOUND", message: error.message || "User not found." });
      }
    }),

  /**
   * user.getPlan — returns plan and credits for the authenticated user.
   */
  getPlan: protectedProcedure.output(planOutput).query(async ({ ctx }) => {
    try {
      return await userService.getPlan(ctx.user.id);
    } catch (error: any) {
      throw new TRPCError({ code: "NOT_FOUND", message: error.message || "User not found." });
    }
  }),
});
