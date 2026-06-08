export const DEV_AUTHZ_STORAGE_KEY = "hladstat:dev-authz";

export const DEV_AUTHZ_HEADER = "x-dev-authz-role";
export const DEV_AUTHZ_ARCHIVED_HEADER = "x-dev-authz-archived";
export const DEV_AUTHZ_LOCKED_HEADER = "x-dev-authz-locked";

export const devAuthzRoles = ["owner", "player", "shared", "public"] as const;

export type DevAuthzRole = (typeof devAuthzRoles)[number];

export type DevAuthzOverrideState = {
  role: DevAuthzRole | "off";
  simulateArchived: boolean;
  simulateLocked: boolean;
};

export const defaultDevAuthzOverrideState: DevAuthzOverrideState = {
  role: "off",
  simulateArchived: false,
  simulateLocked: false,
};

export function parseDevAuthzRole(
  value: string | null,
): DevAuthzRole | null {
  if (!value) return null;

  if (devAuthzRoles.includes(value as DevAuthzRole)) {
    return value as DevAuthzRole;
  }

  return null;
}

export function isDevAuthzOverrideActive(
  state: DevAuthzOverrideState,
): boolean {
  return state.role !== "off";
}

export function readDevAuthzOverrideState(): DevAuthzOverrideState {
  if (typeof window === "undefined") {
    return defaultDevAuthzOverrideState;
  }

  try {
    const stored = sessionStorage.getItem(DEV_AUTHZ_STORAGE_KEY);
    if (!stored) return defaultDevAuthzOverrideState;

    return {
      ...defaultDevAuthzOverrideState,
      ...(JSON.parse(stored) as Partial<DevAuthzOverrideState>),
    };
  } catch {
    return defaultDevAuthzOverrideState;
  }
}

export function devAuthzHeadersFromState(
  state: DevAuthzOverrideState,
): Record<string, string> {
  if (!isDevAuthzOverrideActive(state)) {
    return {};
  }

  return {
    [DEV_AUTHZ_HEADER]: state.role,
    [DEV_AUTHZ_ARCHIVED_HEADER]: state.simulateArchived ? "1" : "0",
    [DEV_AUTHZ_LOCKED_HEADER]: state.simulateLocked ? "1" : "0",
  };
}
