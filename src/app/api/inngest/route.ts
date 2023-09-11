import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { inviteAdmins, listAdmins } from "~/inngest/events";

// Create an API that serves zero functions

export const { GET, POST, PUT } = serve(inngest, [listAdmins, inviteAdmins]);
