import { PromisePool } from "@supercharge/promise-pool";
import { clerkClient } from "@clerk/nextjs";

import { CREATED_BY } from "~/lib/constants";
import { inngest } from "~/inngest/client";
import { checkInviteStatus } from "./lib";
import { db } from "~/drizzle/db";
import { eq } from "drizzle-orm";
import { existingUser, organization } from "~/drizzle/schema";

export const inviteMembers = inngest.createFunction(
  { name: "Invite basic members to organization" },
  { event: "organization/invite.members" },
  async ({ event, step, logger }) => {
    const members = await step.run("Get basic members", getMembers);

    const { results } = await PromisePool.withConcurrency(100)
      .for(members)
      .process(async ({ email, clerkOrgId }) => {
        const inviteStatus = await step.run("Can invite user", () =>
          checkInviteStatus(email, clerkOrgId)
        );

        if (inviteStatus !== "can invite") {
          const warning = { email, clerkOrgId, inviteStatus };
          logger.warn("Unable to invite user", warning);
          return warning;
        }

        const { id, role, status, createdAt } = await step.run(
          "Invite basic member",
          () =>
            clerkClient.organizations.createOrganizationInvitation({
              emailAddress: email,
              inviterUserId: CREATED_BY,
              organizationId: clerkOrgId,
              role: "basic_member",
            })
        );

        await step.run("Update import status", () =>
          updateImportStatus(clerkOrgId)
        );

        return { email, clerkOrgId, role, status, createdAt, id };
      });

    return results;
  }
);

const getMembers = () =>
  db
    .select({
      email: existingUser.email,
      clerkOrgId: organization.clerkOrgId,
    })
    .from(existingUser)
    .innerJoin(organization, eq(existingUser.orgNr, organization.subOrgNr))
    .where(eq(existingUser.role, "member"));

const updateImportStatus = (clerkOrgId: string) =>
  db
    .update(organization)
    .set({ hasImportedMembers: true })
    .where(eq(organization.clerkOrgId, clerkOrgId));
