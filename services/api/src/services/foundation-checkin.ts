import { randomUUID } from "node:crypto";

export type FoundationCheckin = {
  id: string;
  name: string;
  createdAt: string;
};

// In-memory only: the API has no database wiring yet; replace with a repository when it does.
const checkins: FoundationCheckin[] = [];

export function createFoundationCheckin(name: string): FoundationCheckin {
  const checkin: FoundationCheckin = {
    id: randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };

  checkins.push(checkin);

  return checkin;
}

/**
 * Retrieves all stored checkins to satisfy collection usage requirements.
 */
export function getFoundationCheckins(): FoundationCheckin[] {
  return [...checkins];
}
