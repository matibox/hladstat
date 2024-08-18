"use client";

import { type PLACEHOLDER_PLAYERS } from "~/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ShirtIcon } from "lucide-react";

export default function PlayerCard({
  player,
}: {
  player: (typeof PLACEHOLDER_PLAYERS)[number];
}) {
  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="flex-row justify-between space-y-0 p-4">
        <div>
          <CardTitle>
            {player.firstName} {player.lastName}
          </CardTitle>
          <CardDescription>{player.position}</CardDescription>
        </div>
        <div className="relative">
          <ShirtIcon className="h-12 w-12 fill-current" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-primary-foreground">
            {player.shirtNumber}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-0.5 text-sm">
          <span>{player.stats.matches} meczy/ów</span>
          <span>{player.stats.points} punkty/ów</span>
          <span>{player.stats.attackPerc}% w ataku</span>
          <span>{player.stats.posReceptionPerc}% pozytywnego przyjęcia</span>
          <span>{player.stats.aces} asy/ów</span>
          <span>{player.stats.blocks} bloki/ów</span>
        </div>
      </CardContent>
      {/* delete player, etc. */}
    </Card>
  );
}
