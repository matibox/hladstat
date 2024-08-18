"use client";

import { type PLACEHOLDER_MATCHES } from "~/lib/constants";
import { ArrowRightIcon, CalendarIcon, SwordsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import dayjs from "dayjs";

export default function MatchCard({
  match,
}: {
  match: (typeof PLACEHOLDER_MATCHES)[number];
}) {
  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex flex-col text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <SwordsIcon className="h-4 w-4" />
            <span>{match.vs}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{dayjs(match.date).format("YYYY/MM/DD")}</span>
          </div>
        </div>
        <h2 className="text-4xl font-semibold leading-none tracking-tight">
          {match.score}
        </h2>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-0.5 text-sm">
          <span>{match.teamStats.attackPerc}% w ataku</span>
          <span>{match.teamStats.posReceptionPerc}% pozytywnego przyjęcia</span>
          <span>
            {match.teamStats.aces}{" "}
            {match.teamStats.aces === 1 ? "as" : "asy/ów"}
          </span>
          <span>
            {match.teamStats.blocks}{" "}
            {match.teamStats.blocks === 1 ? "blok" : "bloki/ów"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button size="sm" variant="secondary" className="ml-auto">
          <span>Ekran meczu</span>
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
