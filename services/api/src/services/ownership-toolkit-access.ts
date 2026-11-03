import { desc } from "drizzle-orm";

import { db } from "@build-me/database/drizzle/client";
import { ownershipToolkitAccesses } from "@build-me/database/schema/ownership-toolkit-accesses";

export type CreateOwnershipToolkitAccessInput = {
  fullName: string;
  visitorEmail: string;
};

export type OwnershipToolkitAccessResult = {
  id: string;
  fullName: string;
  visitorEmail: string;
  createdAt: string;
};

export async function createOwnershipToolkitAccess(
  input: CreateOwnershipToolkitAccessInput,
): Promise<OwnershipToolkitAccessResult> {
  const [created] = await db
    .insert(ownershipToolkitAccesses)
    .values({
      fullName: input.fullName,
      visitorEmail: input.visitorEmail,
    })
    .returning({
      id: ownershipToolkitAccesses.id,
      fullName: ownershipToolkitAccesses.fullName,
      visitorEmail: ownershipToolkitAccesses.visitorEmail,
      createdAt: ownershipToolkitAccesses.createdAt,
    });

  if (!created) {
    throw new Error("Failed to persist the Ownership Toolkit access.");
  }

  return {
    id: created.id,
    fullName: created.fullName,
    visitorEmail: created.visitorEmail,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function listOwnershipToolkitAccesses(): Promise<
  OwnershipToolkitAccessResult[]
> {
  const accesses = await db
    .select({
      id: ownershipToolkitAccesses.id,
      fullName: ownershipToolkitAccesses.fullName,
      visitorEmail: ownershipToolkitAccesses.visitorEmail,
      createdAt: ownershipToolkitAccesses.createdAt,
    })
    .from(ownershipToolkitAccesses)
    .orderBy(desc(ownershipToolkitAccesses.createdAt));

  return accesses.map((access) => ({
    id: access.id,
    fullName: access.fullName,
    visitorEmail: access.visitorEmail,
    createdAt: access.createdAt.toISOString(),
  }));
}
