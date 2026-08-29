import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@repo/env";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });
export * from "./schema";
export * from "drizzle-orm";
export default db;
