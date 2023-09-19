import { inngest } from "~/inngest/client";
import { getAdmins } from "~/lib/queries";

export const listAdmins = inngest.createFunction(
  { name: "List all admin users within organization" },
  { event: "organization/list.admin" },
  async ({ event, step, logger }) => {
    const admins = await step.run("List admins", getAdmins);

    logger.info("Admins", admins);

    return { admins };
  }
);
