"use server";

import { inngest } from "~/inngest/client";

export const inviteMembersAction = async (
  clerkOrgId: string,
  emails: string[]
) => {
  await inngest.send({
    name: "organization/invite.members",
    data: {
      clerkOrgId,
      emails,
    },
  });
};
