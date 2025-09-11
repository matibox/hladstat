"use client";

import { ShirtIcon } from "lucide-react";
import PlayerStatsDialog from "./PlayerStatsDialog";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";
import { cn } from "~/lib/utils";

export function TeamPlayers() {
  const { teamId } = useTeamContext();
  const [players] = api.user.byTeamPlayers.useSuspenseQuery({ teamId });

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          header={
            <div className="flex items-center gap-4">
              <PlayerStatsDialog player={player} set="Ogółem" />
              <div
                className={cn("relative hidden sm:block", {
                  "opacity-50": !player.isActive,
                })}
              >
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
  player: { firstName, lastName, position, shirtNumber, isActive },
  header,
  children,
}: {
  player: RouterOutputs["user"]["byTeamPlayers"][number];
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card
      className={cn("w-full border-none bg-muted/25", {
        "bg-muted/10": !isActive,
      })}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <div>
          <CardTitle className={cn({ "opacity-50": !isActive })}>
            {firstName} {lastName}
          </CardTitle>
          <CardDescription className={cn({ "opacity-50": !isActive })}>
            <span>{position}</span>
            <span className="sm:hidden">
              {!!shirtNumber && `, ${shirtNumber}`}
            </span>
          </CardDescription>
        </div>
        {header}
      </CardHeader>
      {children}
    </Card>
  );
}
