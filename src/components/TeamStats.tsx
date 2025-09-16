"use client";

import { api } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";
import {
  AttackChart,
  ReceptionChart,
  ScorersChart,
  ServeChart,
  SetDistributionChart,
} from "./StatsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { countPointsAndErrors, countStat } from "~/lib/stats";

export default function TeamStats() {
  const { teamId, currentSeason } = useTeamContext();

  const [stats] = api.stats.byTeamAndSeason.useSuspenseQuery({
    teamId,
    season: currentSeason,
  });

  const { points, errors } = countPointsAndErrors(stats);

  return (
    <>
      <SetDistributionChart stats={stats} defaultMode="position" />
      <ScorersChart stats={stats} mode="pie" />
      <AttackChart stats={stats} />
      <ReceptionChart stats={stats} />
      <ServeChart stats={stats} />
      <Card className="border-none bg-muted/25">
        <CardHeader className="p-4">
          <CardTitle className="text-xl leading-none">
            Inne statystyki
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex gap-16">
            <div className="flex flex-col text-muted-foreground">
              <span>Punkty</span>
              <span>Błędy</span>
              <span>Bloki</span>
              <span>Obrony</span>
            </div>
            <div className="flex flex-col">
              <span>{points}</span>
              <span>{errors}</span>
              <span>{countStat(stats, ["other-blk"])}</span>
              <span>{countStat(stats, ["other-dig"])}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
