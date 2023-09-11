import { OrganizationSwitcher, auth, currentUser } from "@clerk/nextjs";
import { db } from "~/drizzle/db";

// import { businessAdmin } from "~/drizzle/schema";
import { member, organization } from "~/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { User } from "@clerk/nextjs/server";

export default async function OrgSelectionPage() {
  const user = await currentUser();
  if (!user) return null;

  const emailAddresses = user.emailAddresses.map(
    ({ emailAddress }) => emailAddress
  );

  const [m] = await db
    .select({
      role: member.role,
    })
    .from(member)
    .where(inArray(member.email, emailAddresses))
    .innerJoin(organization, eq(organization.orgNr, member.orgNr))
    .limit(1);
  if (!m) return null;

  const isAdmin = m.role === "admin";

  console.log(isAdmin);

  return (
    <main className="flex flex-col items-center gap-8 w-full flex-1 p-20 text-center">
      <h1 className="text-3xl font-bold">VELG BEDRIFT</h1>
      <OrganizationSwitcher hidePersonal createOrganizationMode="modal" />
    </main>
  );
}

const getPrimaryEmail = ({ emailAddresses, primaryEmailAddressId }: User) =>
  emailAddresses.find(({ id }) => id === primaryEmailAddressId);

const getOrgMembers = (orgNr: number) =>
  db.select().from(member).where(eq(member.orgNr, orgNr));
