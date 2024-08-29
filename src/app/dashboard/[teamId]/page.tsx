import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCards from "~/components/MatchCards";
import NewMatchForm from "~/components/NewMatchForm";
import TeamPlayers from "~/components/PlayerCards";
import {
  AttackChart,
  ReceptionChart,
  ScorersChart,
  ServeChart,
  SetDistributionChart,
} from "~/components/StatsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { countPointsAndErrors, countStat } from "~/lib/stats";
import { api, HydrateClient } from "~/trpc/server";

export default async function Team({
  params: { teamId: _teamId },
}: {
  params: { teamId: string };
}) {
  const teamId = parseInt(_teamId);

  await api.team.players.prefetch({ teamId: teamId });
  await api.team.recentMatches.prefetch({ teamId: teamId });
  const stats = await api.team.stats({ teamId: teamId });

  const { points, errors } = countPointsAndErrors(stats);

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        {/* matches */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
            <NewMatchForm teamId={teamId} />
          </div>
          <MatchCards teamId={teamId} />
        </section>
        {/* players */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-semibold">Zawodnicy</h2>
            <AddPlayerForm teamId={teamId} />
          </div>
          <TeamPlayers teamId={teamId} />
        </section>
        {/* stats */}
        <section className="flex w-full flex-col gap-4 md:col-span-2">
          <h2 className="text-2xl font-semibold">Statystyki drużyny</h2>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <SetDistributionChart stats={stats} />
            <ScorersChart stats={stats} />
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
          </div>
        </section>
        {/* settings/danger zone */}
        {/* <section></section> */}
      </main>
    </HydrateClient>
  );
}
