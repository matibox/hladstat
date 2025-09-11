"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { type Season } from "~/lib/constants";
import { getCurrentSeason } from "~/lib/seasons";

type TeamContext = {
  teamId: number;
  isPlayerOrOwner: boolean;
  tabs: [string, ...string[]];
  currentSeason: Season;
  setCurrentSeason: (season: Season) => void;
};

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
  isShared = false,
  isPlayerOrOwner = false,
}: {
  teamId: number;
  children: React.ReactNode;
  isShared?: boolean;
  isPlayerOrOwner?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentSeason, setCurrentSeason] = useState<Season>(() =>
    getCurrentSeason(),
  );

  const tabs = ["matches", "members", "stats"] as [string, ...string[]];
  if (isPlayerOrOwner && !isShared) tabs.push("settings");

  if (!isPlayerOrOwner && searchParams.get("t") === "settings") {
    router.push(`/dashboard/${teamId}?t=matches`);
  }

  return (
    <TeamContext.Provider
      value={{ teamId, isPlayerOrOwner, tabs, currentSeason, setCurrentSeason }}
    >
      {children}
    </TeamContext.Provider>
  );
}
