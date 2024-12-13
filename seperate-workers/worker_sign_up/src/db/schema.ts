import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const distanceEnum = pgEnum("distance", ["10", "half", "full"]);

export const runners = pgTable("runners", {
  id: serial("id").primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  address: text("address"),
  distance: distanceEnum("distance"),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
