"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultDevAuthzOverrideState,
  DEV_AUTHZ_STORAGE_KEY,
  isDevAuthzOverrideActive,
  type DevAuthzOverrideState,
} from "~/dev/authz-override";

type DevAuthzContextValue = DevAuthzOverrideState & {
  isActive: boolean;
  setRole: (role: DevAuthzOverrideState["role"]) => void;
  setSimulateArchived: (value: boolean) => void;
  setSimulateLocked: (value: boolean) => void;
  reset: () => void;
};

const DevAuthzContext = createContext<DevAuthzContextValue | null>(null);

export function useDevAuthz() {
  return useContext(DevAuthzContext);
}

export default function DevAuthzProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevAuthzOverrideState>(
    defaultDevAuthzOverrideState,
  );

  useEffect(() => {
    setState(readStoredState());
  }, []);

  useEffect(() => {
    sessionStorage.setItem(DEV_AUTHZ_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<DevAuthzContextValue>(
    () => ({
      ...state,
      isActive: isDevAuthzOverrideActive(state),
      setRole: (role) => setState((current) => ({ ...current, role })),
      setSimulateArchived: (simulateArchived) =>
        setState((current) => ({ ...current, simulateArchived })),
      setSimulateLocked: (simulateLocked) =>
        setState((current) => ({ ...current, simulateLocked })),
      reset: () => setState(defaultDevAuthzOverrideState),
    }),
    [state],
  );

  return (
    <DevAuthzContext.Provider value={value}>{children}</DevAuthzContext.Provider>
  );
}

function readStoredState(): DevAuthzOverrideState {
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
