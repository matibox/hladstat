import type { Role } from "~/lib/constants";

import type { TeamMembership } from "./queries";

export function canReadTeam(role: Role): boolean {
  return role === "owner" || role === "player" || role === "shared";
}

export function canEditTeam(role: Role): boolean {
  return role === "owner" || role === "player";
}

export function canManageTeam(role: Role): boolean {
  return role === "owner";
}

export function canEditTeamContent(
  membership: TeamMembership | null,
): boolean {
  if (!membership || !canEditTeam(membership.role)) {
    return false;
  }

  return !membership.teamArchived;
}

type CanReadMatchParams = {
  membership: TeamMembership | null;
  matchShared: boolean;
};

export function canReadMatch({
  membership,
  matchShared,
}: CanReadMatchParams): boolean {
  if (membership && canReadTeam(membership.role)) {
    return true;
  }

  return matchShared;
}

type CanEditMatchParams = {
  membership: TeamMembership | null;
  matchLocked: boolean;
};

export function canEditMatch({
  membership,
  matchLocked,
}: CanEditMatchParams): boolean {
  if (!canEditTeamContent(membership)) {
    return false;
  }

  return !matchLocked;
}
