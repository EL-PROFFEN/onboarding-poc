import { clerkClient } from "@clerk/nextjs";

export const hasMembership = async (email: string, orgId: string) => {
  const [existingUser] = await clerkClient.users.getUserList({
    emailAddress: [email],
  });
  if (!existingUser) return false;

  const memberships = await clerkClient.users.getOrganizationMembershipList({
    userId: existingUser.id,
  });
  return memberships.find(({ organization }) => organization.id === orgId);
};

export const isInvited = async (email: string, orgId: string) => {
  const pendingInvites =
    await clerkClient.organizations.getPendingOrganizationInvitationList({
      organizationId: orgId,
    });

  return pendingInvites.find(({ emailAddress }) => emailAddress === email);
};

export const checkInviteStatus = async (email: string, clerkOrgId: string) => {
  const hasUserMembership = await hasMembership(email, clerkOrgId);
  if (hasUserMembership) {
    // logger.warn("User already has membership", { email, clerkOrgId });
    return "has membership";
  }

  const isUserInvited = await isInvited(email, clerkOrgId);
  if (isUserInvited) {
    // logger.warn("User already invited", { email, clerkOrgId });
    return "already invited";
  }
  return "can invite";
};
