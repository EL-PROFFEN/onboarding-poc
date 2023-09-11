import { PromisePool } from "@supercharge/promise-pool";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { member, organization } from "~/drizzle/schema";
import clerk from "@clerk/clerk-sdk-node";
import { inngest } from "./client";

const CREATED_BY = process.env.DEFAULT_ADMIN_USER_ID as string;

export const listAdmins = inngest.createFunction(
  { name: "List all admin users within organization" },
  { event: "user/admin.list" },
  async ({ event, step, logger }) => {
    const admins = await step.run("List admins", getAdmins);

    logger.info("Admins", admins);

    return { admins };
  }
);

export const inviteAdmins = inngest.createFunction(
  { name: "Invite admin users to organization" },
  { event: "user/admin.invite" },
  async ({ event, step, logger }) => {
    const admins = await step.run("Get admins", getAdmins);

    const { results } = await PromisePool.withConcurrency(100)
      .for(admins)
      .process(async ({ email, clerkOrgId }) => {
        const canInvite = await step.run("Can invite admin", async () => {
          const hasUserMembership = await hasMembership(email, clerkOrgId);
          if (hasUserMembership) {
            logger.warn("User already has membership", { email, clerkOrgId });
            return false;
          }

          const isUserInvited = await isInvited(email, clerkOrgId);
          if (isUserInvited) {
            logger.warn("User already invited", { email, clerkOrgId });
            return false;
          }
          return true;
        });

        if (!canInvite) return;

        const { id, role, status, createdAt } = await step.run(
          "Invite admin",
          () =>
            clerk.organizations.createOrganizationInvitation({
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

const hasMembership = async (email: string, orgId: string) => {
  const [existingUser] = await clerk.users.getUserList({
    emailAddress: [email],
  });
  if (!existingUser) return false;

  const memberships = await clerk.users.getOrganizationMembershipList({
    userId: existingUser.id,
  });
  return memberships.find(({ organization }) => organization.id === orgId);
};

const isInvited = async (email: string, orgId: string) => {
  const pendingInvites =
    await clerk.organizations.getPendingOrganizationInvitationList({
      organizationId: orgId,
    });

  return pendingInvites.find(({ emailAddress }) => emailAddress === email);
};

const getAdmins = () =>
  db
    .select({
      email: member.email,
      clerkOrgId: organization.clerkOrgId,
    })
    .from(member)
    .innerJoin(organization, eq(member.orgNr, organization.orgNr))
    .where(eq(member.role, "admin"));
