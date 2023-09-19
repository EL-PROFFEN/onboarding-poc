import { clerkClient } from "@clerk/clerk-sdk-node";
import { inArray } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { organization } from "~/drizzle/schema";
import {
  AddOrganization,
  addOrganizationsSchema,
  inngest,
} from "~/inngest/client";
import { PromisePool } from "@supercharge/promise-pool";

const getAllOrganizations = () =>
  clerkClient.organizations.getOrganizationList({
    limit: 200,
  });

const getClerkOrg = async (clerkOrgId: string) =>
  clerkClient.organizations.getOrganization({
    organizationId: clerkOrgId,
  });

const filterNewOrgs = async (orgNrs: number[]) => {
  const existingOrgs = await db
    .select()
    .from(organization)
    .where(inArray(organization.orgNr, orgNrs));

  // return only the lsit of org numbers that is not in the database
  return orgNrs.filter(
    (orgNr) => !existingOrgs.some((org) => org.orgNr === orgNr)
  );
};

const getOrg = (orgNr: number) =>
  db.query.organization.findFirst({
    where: (fields, { eq }) => eq(fields.orgNr, orgNr),
  });

const filterNewOrg = async (newOrg: AddOrganization) => {
  const org = await getOrg(orgNr);
  return Boolean(org);
};

export const addOrganizations = inngest.createFunction(
  { name: "Add a list of Organizations" },
  { event: "organizations/sync.add" },
  async ({ event, step, logger }) => {
    const data = addOrganizationsSchema.parse(event.data);

    const { results } = await PromisePool.for(data).process((org) =>
      step.run("Filter out existing organizations", async () =>
        (await filterNewOrg(org.orgNr)) ? org : null
      )
    );

    const cler = await step.run(
      "Get the id of all clerk organizations",
      async () => {
        const orgNrs = data.map(({ orgNr }) => orgNr);
        const newOrgs = await filterNewOrgs(orgNrs);

        // const orgs = await getAllOrganizations();
        // return orgs.map(({id, privateMetadata}) => ({
        //   id,
        //   orgNr: privateMetadata.orgNr,
        // }));
      }
    );
  }
);
