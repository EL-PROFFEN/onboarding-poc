import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { address, organization } from "~/drizzle/schema";

const getOrg = async (orgNr: number) => {
  const org = await db
    .select()
    .from(organization)
    .where(eq(organization.orgNr, orgNr));

  console.log("org", org);

  return org;
};

const getParentOrgBySubOrgNr = async (subOrgId: number) => {
  const parentOrg = await db
    .select()
    .from(organization)
    .where(eq(organization.orgNr, subOrgId))
    .innerJoin(organization, eq(organization.orgNr, organization.parentOrgNr));

  console.log("parentOrg", parentOrg);

  return parentOrg;
};

// use orgNr to retrieve all addresses for an org
export const getOrgAddresses = async (orgNr: number) => {
  const orgAddresses = await db
    .select()
    .from(address)
    .where(eq(address.orgNr, orgNr));

  console.log("orgAddresses", orgAddresses);

  return orgAddresses;
};

// use parentOrgNr to retrieve all sub orgs and their addresses
export const getSubOrgWithAddresses = async (parentOrgNr: number) => {
  const subOrgsWithAddresses = await db
    .select()
    .from(organization)
    .where(eq(organization.parentOrgNr, parentOrgNr))
    .leftJoin(address, eq(organization.orgNr, address.orgNr));

  console.log("subOrgsWithAddresses", subOrgsWithAddresses);

  return subOrgsWithAddresses;
};

const getAddressesOfAllSubOrgsByParentOrgNr = async (parentOrgNr: number) => {
  const res = await db
    .select({
      city: address.city,
      orgNr: organization.orgNr,
      orgName: organization.orgName,
    })
    .from(organization)
    .where(eq(organization.parentOrgNr, parentOrgNr))
    .leftJoin(address, eq(organization.orgNr, address.orgNr));
  console.log("res", res);
};

const main = async () => {
  const parentOrgNr = 992090006;
  // await getOrgAddresses(parentOrgId);
  // await getSubOrgWithAddresses(parentOrgId);
  await getAddressesOfAllSubOrgsByParentOrgNr(parentOrgNr);

  const subOrgNr = 974752875;
  // await getParentOrgBySubOrgNr(subOrgNr);
};

main().catch(console.error);
