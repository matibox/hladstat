"use client";

import {
  ArrowRightIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  SwordsIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { api, type RouterOutputs } from "~/trpc/react";

export default function MatchCards({ teamId }: { teamId: number }) {
  const [matches] = api.team.recentMatches.useSuspenseQuery({ teamId });

  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
      {matches.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Brak ostatnich meczów.
        </p>
      ) : (
        <Button className="self-end" size="sm" variant="secondary">
          <span>Wszystkie mecze</span>
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: RouterOutputs["team"]["recentMatches"][number];
}) {
  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <CardTitle className="text-4xl font-semibold leading-none">
          {match.score}
        </CardTitle>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="ml-auto"
                aria-label="Ekran meczu"
              >
                <ChartNoAxesCombinedIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ekran meczu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      {/* <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-0.5 text-sm">
          <p>{match.teamStats.attackPerc}% w ataku</p>
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
      </CardContent> */}
    </Card>
  );
}
