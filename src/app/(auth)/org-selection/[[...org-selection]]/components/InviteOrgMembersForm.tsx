"use client";

import { Button } from "~/components/ui/button";
import { inviteMembersAction } from "../_actions";

interface InviteOrgMembersFormProps {
  clerkOrgId: string;
  emails: string[];
}

export function InviteOrgMembersForm({
  clerkOrgId,
  emails,
}: InviteOrgMembersFormProps) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await inviteMembersAction(clerkOrgId, emails);
      }}
    >
      <Button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
        INVITER ALLE
      </Button>
    </form>
  );
}
