import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";
import { insertOrganizationSchema } from "~/drizzle/schema";

type InviteAdmins = {
  data: {};
};

type InviteMembers = {
  data: {
    clerkOrgId: string;
    emails: string[];
  };
};

type ListAdmins = {
  data: {};
};

export const addOrganizationSchema = insertOrganizationSchema.pick({
  orgNr: true,
  parentOrgNr: true,
});
export const addOrganizationsSchema = z.array(addOrganizationSchema);
export type AddOrganization = z.infer<typeof addOrganizationSchema>;
export type AddOrganizations = z.infer<typeof addOrganizationsSchema>;

type Events = {
  "organization/invite.admins": InviteAdmins;
  "organization/invite.members": InviteMembers;
  "organization/list.admin": ListAdmins;
  "organizations/sync.add": { data: AddOrganizations };
  "organization/sync.brreg": { data: AddOrganization };
};

export const inngest = new Inngest({
  name: "Clerk Onboarding POC",
  schemas: new EventSchemas().fromRecord<Events>(),
});
