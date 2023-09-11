import fs from "fs";
import csv from "csv-parser";
import clerk from "@clerk/clerk-sdk-node";
import { db } from "~/drizzle/db";
import { InsertOrganization, organization } from "~/drizzle/schema";

type OrgRow = Omit<InsertOrganization, "clerkOrgId">;

const CREATED_BY = process.env.DEFAULT_ADMIN_USER_ID as string;

const getAllOrganizations = () =>
  clerk.organizations.getOrganizationList({
    limit: 200,
  });

const main = async () => {
  const allOrganizations = await getAllOrganizations();
  console.log("All organizations", allOrganizations);

  fs.createReadStream("./scripts/organizations.csv")
    .pipe(csv())
    .on("data", async ({ orgName, orgNr }: OrgRow) => {
      try {
        const existingOrg = allOrganizations.find(
          (org) => org.privateMetadata.orgNr === orgNr
        );

        if (existingOrg) return;

        const { id: clerkOrgId } = await clerk.organizations.createOrganization(
          {
            name: orgName,
            createdBy: CREATED_BY,
            privateMetadata: {
              orgNr,
            },
          }
        );

        console.log("Created organization", clerkOrgId, orgName, orgNr);

        await db.insert(organization).values({
          orgNr,
          orgName,
          clerkOrgId,
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
};

main();
