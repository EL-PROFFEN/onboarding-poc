import { EventSchemas, Inngest } from "inngest";

type InviteAdmins = {
  data: {};
};

type ListAdmins = {
  data: {};
};

type DeleteInvites = {
  data: {
    clerkOrgId: string;
  };
};

type Events = {
  "user/admin.invite": InviteAdmins;
  "user/admin.list": ListAdmins;
  "organization/invite.delete.all": DeleteInvites;
};

export const inngest = new Inngest({
  name: "My App",
  schemas: new EventSchemas().fromRecord<Events>(),
});
