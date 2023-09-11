import { relations } from "drizzle-orm";
import {
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const member = mysqlTable(
  "member",
  {
    email: varchar("email", { length: 255 }).notNull().unique(),
    orgNr: int("org_nr").notNull(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "member"]).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.email, table.orgNr),
  })
);

const orgNrValidation = z.string().transform((value) => {
  if (value.length !== 9) throw new Error("OrgNr must be 9 digits");
  return Number(value);
});

export const selectMemberSchema = createSelectSchema(member);
export const insertMemberSchema = createInsertSchema(member, {
  email: z.string().email(),
  orgNr: orgNrValidation,
});

export type Member = z.infer<typeof selectMemberSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.orgNr],
    references: [organization.orgNr],
  }),
}));

export const organization = mysqlTable("organization", {
  orgNr: int("org_nr").primaryKey(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).notNull(),
});

export const selectOrganizationSchema = createSelectSchema(organization);
export const insertOrganizationSchema = createInsertSchema(organization, {
  orgNr: orgNrValidation,
  orgName: z.string().min(1),
});
export type Organization = z.infer<typeof selectOrganizationSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  addresses: many(organizationAddress),
}));

export const address = mysqlTable("address", {
  id: int("id").primaryKey().autoincrement(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  postalCode: varchar("post_code", { length: 255 }).notNull(),
  county: varchar("post_place", { length: 255 }),
  region: varchar("region", { length: 255 }),
  country: varchar("country", { length: 255 }).notNull().default("Norway"),
  floorNr: varchar("floor_nr", { length: 255 }),
});

export const organizationAddress = mysqlTable(
  "organization_address",
  {
    addressId: int("address_id").notNull(),
    orgNr: int("org_nr").notNull(),
    addressType: mysqlEnum("address_type", [
      "primary",
      "delivery",
      "billing",
    ]).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.orgNr, table.addressId, table.addressType),
  })
);

export const organizationAddressRelations = relations(
  organizationAddress,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationAddress.orgNr],
      references: [organization.orgNr],
    }),
    address: one(address, {
      fields: [organizationAddress.addressId],
      references: [address.id],
    }),
  })
);
