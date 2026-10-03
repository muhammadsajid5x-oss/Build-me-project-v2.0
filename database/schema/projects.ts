import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "completed",
  "archived",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  description: text("description"),

  status: projectStatusEnum("status").default("draft").notNull(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
