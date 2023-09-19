import { and, eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { existingUser, organization } from "~/drizzle/schema";
import { InviteOrgMembersForm } from "./InviteOrgMembersForm";

interface UninvitedMembersProps {
  clerkOrgId: string;
}

export async function InviteOrgMembers({ clerkOrgId }: UninvitedMembersProps) {
  const [org] = await db
    .select({
      hasImported: organization.hasImportedMembers,
    })
    .from(organization)
    .where(
      and(
        eq(organization.clerkOrgId, clerkOrgId),
        eq(organization.hasImportedMembers, true)
      )
    )
    .limit(1);

  if (org?.hasImported) return null;

  const orgMembers = await db
    .select({
      email: existingUser.email,
    })
    .from(organization)
    .where(eq(organization.clerkOrgId, clerkOrgId))
    .innerJoin(
      existingUser,
      and(
        eq(organization.subOrgNr, existingUser.orgNr),
        eq(existingUser.role, "member")
      )
    );

  const emails = orgMembers.map((member) => member.email);

  return (
    <div className="flex flex-col items-center gap-8 w-full flex-1 p-20 text-center">
      <InviteOrgMembersForm clerkOrgId={clerkOrgId} emails={emails} />
      <div className="flex flex-col gap-4">
        {orgMembers.map((member) => (
          <div key={member.email}>
            <p>{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
