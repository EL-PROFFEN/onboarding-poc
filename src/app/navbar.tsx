"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import OrgSwitcher from "~/components/org-switcher";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center w-full h-16 px-6 bg-white border-b border-gray-200">
      <OrgSwitcher />
      <Link href="/">Medlemsportalen</Link>
      <Link href="/org-selection">Velg Organisasjon</Link>
      <UserButton />
    </div>
  );
}
