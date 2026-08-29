import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [
    "@repo/database",
    "@repo/services",
    "@repo/trpc",
    "@repo/logger",
    "@repo/env",
    "@repo/validators",
  ],
  external: ["mongoose", "express", "cors", "cookie-parser", "jsonwebtoken", "zod"],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: false,
  sourcemap: false,
});
