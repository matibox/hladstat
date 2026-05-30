"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import TeamCard from "./TeamCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

type UserTeam = RouterOutputs["team"]["ofUser"][number];

function sortByLastMatchDate(teams: UserTeam[]) {
  return [...teams].sort((a, b) => {
    if (a.lastMatchDate && b.lastMatchDate) {
      return b.lastMatchDate.getTime() - a.lastMatchDate.getTime();
    }

    return 0;
  });
}

function getPlayerOrOwnerTeams(
  teams: RouterOutputs["team"]["ofUser"] | undefined,
) {
  if (!teams || teams.length === 0) return [];

  return sortByLastMatchDate(
    teams.filter(
      (team) =>
        (team.userRole === "player" || team.userRole === "owner") &&
        !team.archived,
    ),
  );
}

function getSharedTeams(teams: RouterOutputs["team"]["ofUser"] | undefined) {
  if (!teams || teams.length === 0) return [];

  return sortByLastMatchDate(
    teams.filter((team) => team.userRole === "shared" && !team.archived),
  );
}

function getArchivedTeams(teams: RouterOutputs["team"]["ofUser"] | undefined) {
  if (!teams || teams.length === 0) return [];

  return teams.filter((team) => team.archived);
}

function TeamGrid({ teams }: { teams: RouterOutputs["team"]["ofUser"] }) {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

export default function TeamList() {
  const { data: teams } = api.team.ofUser.useQuery();
  const [archivedOpen, setArchivedOpen] = useState(false);

  const playerOrOwnerTeams = useMemo(
    () => getPlayerOrOwnerTeams(teams),
    [teams],
  );

  const sharedTeams = useMemo(() => getSharedTeams(teams), [teams]);

  const archivedTeams = useMemo(() => getArchivedTeams(teams), [teams]);

  const hasNoTeams =
    playerOrOwnerTeams.length === 0 &&
    sharedTeams.length === 0 &&
    archivedTeams.length === 0;

  if (hasNoTeams) {
    return (
      <p className="col-span-full text-center text-muted-foreground">
        Nie należysz do żadnej drużyny.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {playerOrOwnerTeams.length > 0 && <TeamGrid teams={playerOrOwnerTeams} />}

      {sharedTeams.length > 0 && <TeamGrid teams={sharedTeams} />}

      {archivedTeams.length > 0 && (
        <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <span>Zarchiwizowane drużyny</span>
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                archivedOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <TeamGrid teams={archivedTeams} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
