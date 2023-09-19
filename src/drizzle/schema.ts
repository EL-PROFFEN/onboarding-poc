import { relations } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const existingUser = mysqlTable(
  "ExistingUser",
  {
    email: varchar("email", { length: 255 }).notNull().unique(),
    orgNr: int("orgNr").notNull(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "member"]).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.email, table.orgNr),
  })
);

export const parentOrgNrValidation = z
  .string()
  .optional()
  .refine((value) => !value || (value.length === 9 && !isNaN(Number(value))), {
    message: "OrgNr must be 9 digits",
  })
  .transform((value) => (value !== undefined ? Number(value) : value));

export const orgNrValidation = z
  .string()
  .refine((value) => !value || (value.length === 9 && !isNaN(Number(value))), {
    message: "OrgNr must be 9 digits",
  })
  .transform(Number);

export const selectExistingUserSchema = createSelectSchema(existingUser);
export const insertExistingUserSchema = createInsertSchema(existingUser, {
  email: z.string().email(),
  orgNr: orgNrValidation,
});

export type ExistingUser = z.infer<typeof selectExistingUserSchema>;
export type InsertExistingUser = z.infer<typeof insertExistingUserSchema>;

export const existingUserRelations = relations(existingUser, ({ one }) => ({
  organization: one(organization, {
    fields: [existingUser.orgNr],
    references: [organization.orgNr],
  }),
}));

export const organization = mysqlTable("Organization", {
  orgNr: int("orgNr").primaryKey(),
  orgName: varchar("orgName", { length: 255 }).notNull(),
  parentOrgNr: int("parentOrgNr"),

  clerkOrgId: varchar("clerkOrgId", { length: 255 }).notNull(),
  primaryAddressId: int("primaryAddressId"), // if null, then defaults to external address from enhetsregisteret
  hasImportedMembers: boolean("hasImportedMembers").notNull().default(false),
});

export const selectOrganizationSchema = createSelectSchema(organization);
export const insertOrganizationSchema = createInsertSchema(organization, {
  parentOrgNr: parentOrgNrValidation,
  orgNr: orgNrValidation,
  orgName: z.string().min(1),
  clerkOrgId: z.string().min(1),
});

export type Organization = z.infer<typeof selectOrganizationSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export const organizationRelations = relations(organization, ({ many }) => ({
  existingUsers: many(existingUser),
  addresses: many(address),
}));

export const address = mysqlTable("Address", {
  id: int("id").primaryKey().autoincrement(),
  street: varchar("street", { length: 255 }).notNull(), // eg. "Magnus Lagabøters veg 4"
  postalNr: varchar("postalNr", { length: 255 }).notNull(), // eg. "7047"
  city: varchar("city", { length: 255 }).notNull(), // eg. "Trondheim"
  municipality: varchar("municipality", { length: 255 }).notNull(), // eg. "Trondheim"
  municipalityNr: int("municipalityNr").notNull(), // eg. "1601"
  country: varchar("country", { length: 255 }).notNull().default("Norge"), // eg. "Norge"
  countryCode: varchar("countryCode", { length: 255 }).notNull().default("NO"), // eg. "NO"
  orgNr: int("orgNr").notNull(),

  // county: varchar("county", { length: 255 }).notNull(), // eg. "Trøndelag" (finnes ikke i brreg)
});

// TODO: Add addressType. Should a single address have multiple types? Use another name than addressType?
// export const addressType = mysqlTable("AddressType", {
//   type: mysqlEnum("type", [
//     "delivery",
//     "billing",
//   ]).primaryKey(),
// })

export const selectAddressSchema = createSelectSchema(address);
export const insertAddressSchema = createInsertSchema(address);

export type Address = z.infer<typeof selectAddressSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export const addressRelations = relations(address, ({ one }) => ({
  organization: one(organization, {
    fields: [address.orgNr],
    references: [organization.orgNr],
  }),
}));
