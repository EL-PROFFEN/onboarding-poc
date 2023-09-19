"use client";
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog";
import { OrganizationProfile } from "@clerk/nextjs";

export function OrgProfile() {
  return (
    <Dialog>
      <DialogTrigger>
        <button>Open Organization Profile</button>
      </DialogTrigger>
      <DialogContent className="flex items-center justify-center">
        <OrganizationProfile />
      </DialogContent>
    </Dialog>
  );
}
