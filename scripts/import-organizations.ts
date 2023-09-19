import fs from "fs";
import csv from "csv-parser";
import clerk from "@clerk/clerk-sdk-node";
import { db } from "~/drizzle/db";
import { address, orgNrValidation, organization } from "~/drizzle/schema";
import { z } from "zod";
import { getParentOrgDetails, getSubOrgDetails } from "./get-brr-org-info";

const orgRowSchema = z.object({
  parentOrgNr: orgNrValidation,
  orgNr: orgNrValidation,
});

type OrgRow = z.infer<typeof orgRowSchema>;

const CREATED_BY = process.env.DEFAULT_ADMIN_USER_ID as string;

const getAllOrganizations = () =>
  clerk.organizations.getOrganizationList({
    limit: 200,
  });

const main = async () => {
  const allOrganizations = await getAllOrganizations();

  fs.createReadStream("data/organizations_minimal.csv")
    .pipe(csv())
    .on("data", async ({ parentOrgNr, orgNr }: OrgRow) => {
      const isSameOrg = parentOrgNr === orgNr;

      console.log("Processing", orgNr, parentOrgNr);

      try {
        const existingOrg = allOrganizations.find(
          (org) => org.privateMetadata.orgNr === orgNr
        );

        if (existingOrg) return;

        const { orgAddress, orgName } = isSameOrg
          ? await getParentOrgDetails(parentOrgNr)
          : await getSubOrgDetails(orgNr);

        const { id: clerkOrgId } = await clerk.organizations.createOrganization(
          {
            name: orgName,
            createdBy: CREATED_BY,
            privateMetadata: {
              orgNr,
            },
          }
        );

        await db.insert(organization).values({
          orgNr,
          orgName,
          clerkOrgId,
          parentOrgNr: isSameOrg ? null : parentOrgNr,
        });

        await db.insert(address).values(orgAddress).onDuplicateKeyUpdate({
          set: orgAddress,
        });

        console.log("Created organization", {
          orgName,
          orgNr,
          parentOrgNr,
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
