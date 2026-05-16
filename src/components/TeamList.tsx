"use client";

import { useMemo } from "react";
import TeamCard from "./TeamCard";
import { api } from "~/trpc/react";

export default function TeamList() {
  const { data: teams } = api.team.ofUser.useQuery();

  const sortedTeams = useMemo(
    () =>
      teams
        ? [...teams].sort((_, b) => {
            if (b.userRole === "shared") return -1;
            return 1;
          })
        : [],
    [teams],
  );

  if (!sortedTeams || sortedTeams.length === 0)
    return (
      <p className="col-span-full text-center text-muted-foreground">
        Nie należysz do żadnej drużyny.
      </p>
    );

  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
      {sortedTeams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
