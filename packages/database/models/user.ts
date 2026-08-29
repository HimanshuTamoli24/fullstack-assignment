import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  // Same UUID as auth.users.id
  id: uuid("id").primaryKey(),

  fullName: varchar("full_name", { length: 80 }),

  email: varchar("email", { length: 255 }).notNull().unique(),

  profileImageUrl: text("profile_image_url"),

  plan: varchar("plan", { length: 30 }).notNull().default("free"),

  credits: integer("credits").notNull().default(3),

  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
