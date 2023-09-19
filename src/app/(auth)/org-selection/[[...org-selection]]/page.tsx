import { OrganizationSwitcher, currentUser } from "@clerk/nextjs";
import { db } from "~/drizzle/db";

// import { businessAdmin } from "~/drizzle/schema";
import { existingUser, organization } from "~/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { InviteOrgMembers } from "./components/InviteOrgMembers";
import { AddressForm } from "./components/AddressForm";

export default async function OrgSelectionPage() {
  const user = await currentUser();
  if (!user) return null;

  const emailAddresses = user.emailAddresses.map(
    ({ emailAddress }) => emailAddress
  );

  const [m] = await db
    .select({
      role: existingUser.role,
      clerkOrgId: organization.clerkOrgId,
    })
    .from(existingUser)
    .where(inArray(existingUser.email, emailAddresses))
    .innerJoin(organization, eq(organization.subOrgNr, existingUser.orgNr))
    .limit(1);
  if (!m) return null;
  const isAdmin = m.role === "admin";

  return (
    <main className="flex flex-col items-center gap-8 w-full flex-1 text-center">
      <h1 className="text-3xl font-bold">VELG BEDRIFT</h1>
      <OrganizationSwitcher hidePersonal createOrganizationMode="modal" />
      {isAdmin && <InviteOrgMembers clerkOrgId={m.clerkOrgId} />}
      {isAdmin && <AddressForm />}
    </main>
  );
}
