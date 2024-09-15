"use client";

import { createContext, useContext } from "react";

type TeamContext = { teamId: number };

const TeamContext = createContext<TeamContext | null>(null);

export function useTeamContext() {
  const ctx = useContext(TeamContext);

  if (!ctx) {
    throw new Error(
      "useTeamContext has to be used within <TeamContext.Provider>",
    );
  }

  return ctx;
}

export default function TeamContextProvider({
  teamId,
  children,
}: {
  teamId: number;
  children: React.ReactNode;
}) {
  return (
    <TeamContext.Provider value={{ teamId }}>{children}</TeamContext.Provider>
  );
}
