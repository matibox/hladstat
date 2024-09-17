"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext } from "react";
import { api } from "~/trpc/react";

type TeamContext = { teamId: number; isPlayerOrOwner: boolean };

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
  const { data, isPending } = api.user.isPlayerOrOwner.useQuery({ teamId });
  const isPlayerOrOwner = !isPending ? (data?.isPlayerOrOwner ?? false) : true;
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!isPlayerOrOwner && !isPending && searchParams.get("t") === "settings") {
    router.push(`/dashboard/${teamId}?t=matches`);
  }

  return (
    <TeamContext.Provider value={{ teamId, isPlayerOrOwner }}>
      {children}
    </TeamContext.Provider>
  );
}
