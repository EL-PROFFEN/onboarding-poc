import { EventSchemas, Inngest } from "inngest";

type InviteAdmins = {
  data: {};
};

type ListAdmins = {
  data: {};
};

type Events = {
  "user/admin.invite": InviteAdmins;
  "user/admin.list": ListAdmins;
};

export const inngest = new Inngest({
  name: "Clerk Onboarding POC",
  schemas: new EventSchemas().fromRecord<Events>(),
});
