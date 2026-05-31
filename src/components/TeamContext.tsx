"use client";

import { type Session } from "next-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import { type Role, type Season } from "~/lib/constants";
import { getCurrentSeason } from "~/lib/seasons";
import { canEditTeam, canManageTeam } from "~/server/authz/permissions";
import { api } from "~/trpc/react";

import { useDevAuthz } from "./dev/DevAuthzProvider";

type TeamContext = {
  teamId: number;
  role: Role | null;
  canEdit: boolean;
  isOwner: boolean;
  isArchived: boolean;
  tabs: [string, ...string[]];
  currentSeason: Season;
  setCurrentSeason: (season: Season) => void;
  session: Session | null;
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

function TeamContextInner({
  teamId,
  children,
  isShared,
  role,
  isArchived,
  session,
}: {
  teamId: number;
  children: React.ReactNode;
  isShared: boolean;
  role: Role | null;
  isArchived: boolean;
  session: Session | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentSeason, setCurrentSeason] = useState<Season>(() =>
    getCurrentSeason(),
  );

  const devAuthz = useDevAuthz();
  const effectiveRole = useMemo<Role | null>(() => {
    if (!devAuthz?.isActive || devAuthz.role === "off") {
      return role;
    }

    if (devAuthz.role === "public") {
      return null;
    }

    return devAuthz.role;
  }, [devAuthz, role]);

  const effectiveArchived =
    isArchived || Boolean(devAuthz?.isActive && devAuthz.simulateArchived);

  const isOwner = effectiveRole ? canManageTeam(effectiveRole) : false;
  const canEdit = effectiveRole
    ? canEditTeam(effectiveRole) && !effectiveArchived
    : false;

  const tabs = ["matches", "members", "stats"] as [string, ...string[]];
  if (isOwner && !isShared) tabs.push("settings");

  if (!isOwner && searchParams.get("t") === "settings") {
    router.push(`/dashboard/${teamId}?t=matches`);
  }

  return (
    <TeamContext.Provider
      value={{
        teamId,
        role: effectiveRole,
        canEdit,
        isOwner,
        isArchived: effectiveArchived,
        tabs,
        currentSeason,
        setCurrentSeason,
        session,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

function TeamContextWithArchive({
  teamId,
  children,
  isShared,
  role,
  session,
}: {
  teamId: number;
  children: React.ReactNode;
  isShared: boolean;
  role: Role | null;
  session: Session | null;
}) {
  const [team] = api.team.byId.useSuspenseQuery({ teamId: String(teamId) });

  return (
    <TeamContextInner
      teamId={teamId}
      isShared={isShared}
      role={role}
      isArchived={team?.archived ?? false}
      session={session}
    >
      {children}
    </TeamContextInner>
  );
}

export default function TeamContextProvider({
  teamId,
  children,
  isShared = false,
  role = null,
  session = null,
}: {
  teamId: number;
  children: React.ReactNode;
  isShared?: boolean;
  role?: Role | null;
  session?: Session | null;
}) {
  if (isShared) {
    return (
      <TeamContextInner
        teamId={teamId}
        isShared={isShared}
        role={role}
        isArchived={false}
        session={session}
      >
        {children}
      </TeamContextInner>
    );
  }

  return (
    <TeamContextWithArchive
      teamId={teamId}
      isShared={isShared}
      role={role}
      session={session}
    >
      {children}
    </TeamContextWithArchive>
  );
}
