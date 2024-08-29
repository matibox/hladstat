"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { api } from "~/trpc/react";
import { CalendarIcon, SwordsIcon } from "lucide-react";
import dayjs from "dayjs";
import PlayerCard from "./PlayerCards";
import AddStatisticForm from "./AddStatisticForm";
import {
  AttackChart,
  PointsAndErrorsChart,
  ReceptionChart,
  ScorersChart,
  ServeChart,
  SetDistributionChart,
} from "./StatsCharts";
import PlayerStatsDialog from "./PlayerStatsDialog";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { buttonVariants } from "./ui/button";

export type SetID = "1" | "2" | "3" | "4" | "5" | "Ogółem";

export default function MatchAnalysis({
  teamId,
  matchId,
}: {
  teamId: number;
  matchId: number;
}) {
  const [set, setSet] = useState<SetID>("1");

  const [match] = api.match.byId.useSuspenseQuery({ matchId });
  const [players] = api.team.players.useSuspenseQuery({ teamId });
  const [stats] = api.match.stats.useSuspenseQuery({ teamId, matchId });

  const setArray = [
    ...[...new Array(match.numberOfSets).keys()].map((n) => n + 1),
    "Ogółem",
  ] as Array<SetID>;

  const statsBySet = stats.filter((stat) => {
    if (set === "Ogółem") return true;
    return stat.set === parseInt(set);
  });

  return (
    <Tabs value={set} onValueChange={(set) => setSet(set as SetID)}>
      <header className="sticky -top-10 left-0 z-50 flex flex-col items-center gap-4 border-b bg-background px-4 sm:top-0 sm:flex-row sm:justify-between sm:px-4 sm:py-4 md:mx-6 md:justify-start md:px-0 lg:mx-8 lg:gap-16">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-semibold leading-none">{match.score}</h1>
          <div className="h-8 w-px bg-primary/20" />
          <div className="flex flex-col text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <SwordsIcon className="h-4 w-4" />
              <span>{match.opponent}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{dayjs(match.date).format("DD.MM.YYYY")}</span>
            </div>
          </div>
        </div>
        <div className="sticky left-0 top-0 flex items-center gap-4 pb-4 sm:pb-0 md:mx-auto">
          {/* <span className="text-muted-foreground">Set</span> */}
          <TabsList>
            {setArray.map((set) => (
              <TabsTrigger key={set} value={set.toString()}>
                {set} {set !== "Ogółem" && "set"}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            className={cn(buttonVariants({ variant: "secondary" }))}
            href={`/dashboard/${teamId}/${matchId}#players`}
          >
            Zawodnicy
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "secondary" }))}
            href={`/dashboard/${teamId}/${matchId}#stats`}
          >
            Statystyki
          </Link>
        </div>
      </header>
      <div className="flex flex-col gap-8 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
        <section className="relative flex flex-col gap-4">
          <div className="absolute -top-20" id="players" />
          <h2 className="text-2xl font-semibold leading-none">Zawodnicy</h2>
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                header={
                  <>
                    <PlayerStatsDialog
                      set={set}
                      player={player}
                      matchId={matchId}
                      teamId={teamId}
                    />
                    {set !== "Ogółem" && (
                      <AddStatisticForm
                        set={parseInt(set)}
                        player={player}
                        matchId={matchId}
                      />
                    )}
                  </>
                }
              />
            ))}
          </div>
        </section>
        <section className="relative flex flex-col gap-4">
          <div className="absolute -top-20" id="stats" />
          <h2 className="text-2xl font-semibold leading-none">
            Statystyki drużyny
          </h2>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
            <ScorersChart stats={statsBySet} />
            <SetDistributionChart stats={statsBySet} />
            <PointsAndErrorsChart stats={statsBySet} />
            <AttackChart stats={statsBySet} />
            <ReceptionChart stats={statsBySet} />
            <ServeChart stats={statsBySet} />
          </div>
        </section>
      </div>
    </Tabs>
  );
}
