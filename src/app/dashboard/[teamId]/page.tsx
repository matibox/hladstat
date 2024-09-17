import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCards from "~/components/MatchCards";
import NewMatchForm from "~/components/NewMatchForm";
import { TeamPlayers } from "~/components/PlayerCards";
import {
  AttackChart,
  ReceptionChart,
  ScorersChart,
  ServeChart,
  SetDistributionChart,
} from "~/components/StatsCharts";
import TeamPageNavbar from "~/components/TeamPageNavbar";
import TeamSettings from "~/components/TeamSettings";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TabsContent } from "~/components/ui/tabs";
import { countPointsAndErrors, countStat } from "~/lib/stats";
import { api, HydrateClient } from "~/trpc/server";

export default async function Team({
  params: { teamId: _teamId },
}: {
  params: { teamId: string };
}) {
  const teamId = parseInt(_teamId);

  await api.team.recentMatches.prefetch({ teamId });
  await api.team.players.prefetch({ teamId });
  await api.team.sharedToUsers.prefetch({ teamId });

  const stats = await api.team.stats({ teamId });

  const { points, errors } = countPointsAndErrors(stats);

  return (
    <HydrateClient>
      <TeamPageNavbar>
        <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-[calc(75px_+_1rem)] md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
          <TabsContent value="matches" className="col-span-2">
            <section className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
                <NewMatchForm />
              </div>
              <MatchCards />
            </section>
          </TabsContent>
          <TabsContent value="members" className="md:col-span-2">
            <section className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <h2 className="text-2xl font-semibold">Zawodnicy</h2>
                <AddPlayerForm />
              </div>
              <TeamPlayers />
            </section>
          </TabsContent>
          <TabsContent value="stats" className="md:col-span-2">
            <section className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
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
          </TabsContent>
          <TeamSettings />
        </main>
      </TeamPageNavbar>
    </HydrateClient>
  );
}
