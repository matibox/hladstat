import "server-only";

import { env } from "~/env";

import type { TeamMembership } from "~/server/authz/queries";

import {
  DEV_AUTHZ_ARCHIVED_HEADER,
  DEV_AUTHZ_HEADER,
  DEV_AUTHZ_LOCKED_HEADER,
  parseDevAuthzRole,
  type DevAuthzRole,
} from "./authz-override";

export type DevAuthzOverride = {
  role: DevAuthzRole;
  simulateArchived: boolean;
  simulateLocked: boolean;
};

export type EffectiveMembership = TeamMembership & {
  teamId: number;
};

export function assertDevAuthzOverrideAllowed(): boolean {
  return env.NODE_ENV === "development" && env.DEV_AUTHZ_OVERRIDE === true;
}

export function getDevAuthzOverride(
  headers: Headers,
): DevAuthzOverride | null {
  if (!assertDevAuthzOverrideAllowed()) {
    return null;
  }

  const role = parseDevAuthzRole(headers.get(DEV_AUTHZ_HEADER));
  if (!role) {
    return null;
  }

  return {
    role,
    simulateArchived: headers.get(DEV_AUTHZ_ARCHIVED_HEADER) === "1",
    simulateLocked: headers.get(DEV_AUTHZ_LOCKED_HEADER) === "1",
  };
}

export function applyDevAuthzToMembership(
  membership: EffectiveMembership | null,
  override: DevAuthzOverride | null,
  teamId: number,
): EffectiveMembership | null {
  if (!override) {
    return membership;
  }

  if (override.role === "public") {
    return null;
  }

  if (!membership) {
    return {
      teamId,
      role: override.role,
      teamArchived: override.simulateArchived,
    };
  }

  return {
    ...membership,
    teamId,
    role: override.role,
    teamArchived: override.simulateArchived || membership.teamArchived,
  };
}

export function applyDevAuthzToMatch<
  T extends { lockedAnalysis: boolean | null },
>(match: T, override: DevAuthzOverride | null): T {
  if (!override?.simulateLocked) {
    return match;
  }

  return {
    ...match,
    lockedAnalysis: true,
  };
}
