"use client";

import { ShirtIcon } from "lucide-react";
import PlayerStatsDialog from "./PlayerStatsDialog";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";

export function TeamPlayers() {
  const { teamId } = useTeamContext();
  const [players] = api.team.players.useSuspenseQuery({ teamId });

  return (
    <div className="flex flex-col gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          header={
            <div className="flex items-center gap-4">
              <PlayerStatsDialog player={player} set="Ogółem" />
              <div className="relative hidden sm:block">
                <ShirtIcon className="h-12 w-12 fill-current" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-primary-foreground">
                  {player.shirtNumber ?? "?"}
                </span>
              </div>
            </div>
          }
        />
      ))}
    </div>
  );
}

export default function PlayerCard({
  player: { firstName, lastName, position },
  header,
  children,
}: {
  player: RouterOutputs["team"]["players"][number];
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <div>
          <CardTitle>
            {firstName} {lastName}
          </CardTitle>
          <CardDescription>{position}</CardDescription>
        </div>
        {header}
      </CardHeader>
      {children}
      {/* <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-0.5 text-sm">
          <span>{player.stats.matches} meczy/ów</span>
          <span>{player.stats.points} punkty/ów</span>
          <span>{player.stats.attackPerc}% w ataku</span>
          <span>{player.stats.posReceptionPerc}% pozytywnego przyjęcia</span>
          <span>{player.stats.aces} asy/ów</span>
          <span>{player.stats.blocks} bloki/ów</span>
        </div>
      </CardContent> */}
      {/* maybe stats, delete player, etc. */}
    </Card>
  );
}
