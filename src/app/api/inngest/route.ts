import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { addOrganizations } from "~/inngest/organization/sync/events";
import { inviteAdmins } from "~/inngest/organization/invite/admins";
import { inviteMembers } from "~/inngest/organization/invite/members";
import { listAdmins } from "~/inngest/organization/list/admins";

// Create an API that serves zero functions

export const { GET, POST, PUT } = serve(inngest, [
  addOrganizations,
  listAdmins,
  inviteAdmins,
  inviteMembers,
]);
