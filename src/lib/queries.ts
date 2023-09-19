import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { existingUser, organization } from "~/drizzle/schema";

export const getAdmins = () =>
  db
    .select({
      email: existingUser.email,
      clerkOrgId: organization.clerkOrgId,
    })
    .from(existingUser)
    .innerJoin(organization, eq(existingUser.orgNr, organization.subOrgNr))
    .where(eq(existingUser.role, "admin"));
