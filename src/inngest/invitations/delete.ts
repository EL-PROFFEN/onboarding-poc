import { inngest } from "../client";

export const deleteInvites = inngest.createFunction(
  { name: "Delete all organization invites" },
  { event: "organization/invite.delete.all" },
  async ({ event, step, logger }) => {}
);
