"use client";

import {
  ArrowRightIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  SwordsIcon,
} from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { api, type RouterOutputs } from "~/trpc/react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useTeamContext } from "./TeamContext";

export default function MatchCards() {
  const { teamId, currentSeason } = useTeamContext();
  const [matches] = api.match.byTeamRecent.useSuspenseQuery({
    teamId,
    season: currentSeason,
  });

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
      {matches.length === 0 ? (
        <p className="text-center text-muted-foreground md:col-start-1 md:col-end-3">
          Brak ostatnich meczów. Uważasz, że to błąd? Spróbuj zmienić sezon.
        </p>
      ) : (
        <Link
          href={`/dashboard/${teamId}/matches`}
          className={cn(
            buttonVariants({ size: "sm", variant: "secondary" }),
            "self-end md:col-start-2 md:place-self-end",
          )}
        >
          <span>Wszystkie mecze</span>
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function MatchCard({
  match,
  children,
}: {
  match: RouterOutputs["match"]["byTeamRecent"][number];
  children?: React.ReactNode;
}) {
  const { teamId } = useTeamContext();

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <div className="flex w-[3.25rem] justify-center">
          <CardTitle className="text-4xl font-semibold leading-none">
            {match.score}
          </CardTitle>
        </div>
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
              <Link
                href={`/dashboard/${teamId}/${match.id}`}
                className={cn(
                  buttonVariants({ size: "icon", variant: "secondary" }),
                  "ml-auto",
                )}
                aria-label="Analiza meczu"
              >
                <ChartNoAxesCombinedIcon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Analiza meczu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      {children}
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
