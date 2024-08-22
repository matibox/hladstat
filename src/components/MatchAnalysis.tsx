"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { api } from "~/trpc/react";
import { CalendarIcon, SwordsIcon } from "lucide-react";
import dayjs from "dayjs";
import { PlayerCard } from "./PlayerCards";
import AddStatisticForm from "./AddStatisticForm";
import MatchStats from "./MatchStats";

export default function MatchAnalysis({
  teamId,
  matchId,
}: {
  teamId: number;
  matchId: number;
}) {
  const [set, setSet] = useState("1");

  const [match] = api.match.byId.useSuspenseQuery({ matchId });
  const [players] = api.team.players.useSuspenseQuery({ teamId });

  const setArray = [...new Array(match.numberOfSets).keys()].map((n) => n + 1);

  return (
    <Tabs value={set} onValueChange={setSet}>
      <header className="sticky -top-10 left-0 z-50 flex flex-col items-center gap-4 border-b bg-background px-4 md:px-6 lg:px-8">
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
        <div className="sticky left-0 top-0 flex items-center gap-4 pb-4">
          {/* <span className="text-muted-foreground">Set</span> */}
          <TabsList>
            {setArray.map((setNumber) => (
              <TabsTrigger key={setNumber} value={setNumber.toString()}>
                {setNumber} set
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </header>
      <div className="flex flex-col gap-8 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold leading-none">Zawodnicy</h2>
          <div className="flex flex-col gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                header={
                  <AddStatisticForm
                    set={parseInt(set)}
                    player={player}
                    matchId={matchId}
                  />
                }
              />
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold leading-none">
            Statystyki live
          </h2>
          <MatchStats matchId={matchId} teamId={teamId} set={parseInt(set)} />
        </section>
      </div>
    </Tabs>
  );
}
