import { PromisePool } from "@supercharge/promise-pool";
import { clerkClient } from "@clerk/nextjs";

import { CREATED_BY } from "~/lib/constants";
import { getAdmins } from "~/lib/queries";
import { inngest } from "~/inngest/client";
import { checkInviteStatus } from "./lib";

export const inviteAdmins = inngest.createFunction(
  { name: "Invite admin users to organization" },
  { event: "organization/invite.admins" },
  async ({ event, step, logger }) => {
    const admins = await step.run("Get admins", getAdmins);

    const { results } = await PromisePool.withConcurrency(100)
      .for(admins)
      .process(async ({ email, clerkOrgId }) => {
        const inviteStatus = await step.run("Can invite admin", () =>
          checkInviteStatus(email, clerkOrgId)
        );

        if (inviteStatus !== "can invite") {
          const warning = { email, clerkOrgId, inviteStatus };
          logger.warn("Unable to invite user", warning);
          return warning;
        }

        const { id, role, status, createdAt } = await step.run(
          "Invite admin",
          () =>
            clerkClient.organizations.createOrganizationInvitation({
              emailAddress: email,
              inviterUserId: CREATED_BY,
              organizationId: clerkOrgId,
              role: "admin",
            })
        );

        return { email, clerkOrgId, role, status, createdAt, id };
      });

    return results;
  }
);
