"use client";

import { useOrganization } from "@clerk/nextjs";

export function EditOrgDetails() {
  const { organization, membership } = useOrganization();
  if (membership?.role !== "admin") return null;
}
