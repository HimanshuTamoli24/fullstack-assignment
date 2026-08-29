// import { initTRPC, TRPCError } from "@trpc/server";
// import { OpenApiMeta } from "trpc-to-openapi";

// import { createContext } from "./context";

// export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

// export const router = tRPCContext.router;

// export const publicProcedure = tRPCContext.procedure;

// const isAuthenticated = tRPCContext.middleware(({ ctx, next }) => {
//   if (!ctx.user) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "You must be logged in to access this resource.",
//     });
//   }
//   return next({ ctx: { ...ctx, user: ctx.user } });
// });

// export const protectedProcedure = tRPCContext.procedure.use(isAuthenticated);
// above it previous code

import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";

import { createContext } from "./context";

/**
 * Maps tRPC error codes to clean, human-readable titles for non-validation errors.
 */
function getErrorTitle(code: string): string {
  switch (code) {
    case "BAD_REQUEST":
      return "Bad Request";
    case "UNAUTHORIZED":
      return "Unauthorized";
    case "FORBIDDEN":
      return "Access Denied";
    case "NOT_FOUND":
      return "Resource Not Found";
    case "TIMEOUT":
      return "Request Timeout";
    case "CONFLICT":
      return "Conflict Error";
    case "TOO_MANY_REQUESTS":
      return "Rate Limit Exceeded";
    case "PAYLOAD_TOO_LARGE":
      return "Payload Too Large";
    case "INTERNAL_SERVER_ERROR":
      return "Internal Server Error";
    default:
      return "An Error Occurred";
  }
}

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      // Check if underlying error cause is a ZodError (checking instanceof and fallback name/issues check for monorepo safety)
      const isZodError =
        error.cause instanceof ZodError ||
        (error.cause &&
          typeof error.cause === "object" &&
          "issues" in error.cause &&
          Array.isArray((error.cause as any).issues));

      if (isZodError && error.cause) {
        const zodError = error.cause as ZodError;

        // Simple readable error strings array (e.g. ["title: Required", "email: Invalid email"])
        const errorMessages = zodError.issues.map((issue) =>
          issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
        );

        // Clean single message string so toast.error(error.message) displays directly
        const cleanMessage =
          errorMessages.length > 0 ? errorMessages.join(". ") : "Validation Failed";

        // Structured field/message pairs for form field highlighting
        const fields = zodError.issues.map((issue) => ({
          field: issue.path.length > 0 ? issue.path.join(".") : "root",
          message: issue.message,
        }));

        return {
          ...shape,
          title: "Validation Failed",
          message: cleanMessage,
          errorMessages,
          fields,
        };
      }

      // Preserve non-validation errors (UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR, etc.)
      return {
        ...shape,
        title: getErrorTitle(error.code),
        message: shape.message,
      };
    },
  });

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

const isAuthenticated = tRPCContext.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = tRPCContext.procedure.use(isAuthenticated);
