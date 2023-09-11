import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center w-full h-16 px-4 bg-white border-b border-gray-200">
      <Link href="/">Home</Link>
      <Link href="/org-selection">Velg Organisasjon</Link>
      <UserButton />
    </div>
  );
}
