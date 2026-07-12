import { integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const marketingChannelEnum = pgEnum("marketing_channel", [
  "email",
  "sms",
  "whatsapp",
  "push",
]);

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  age: integer("age").notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  preferredMarketingChannel: marketingChannelEnum("preferred_marketing_channel")
    .notNull()
    .default("email"),
});
