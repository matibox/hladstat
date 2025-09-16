import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCards from "~/components/MatchCards";
import NewMatchForm from "~/components/NewMatchForm";
import { TeamPlayers } from "~/components/PlayerCards";
import { SeasonSelect } from "~/components/SeasonSelect";
import TeamPageNavbar from "~/components/TeamPageNavbar";
import TeamSettings from "~/components/TeamSettings";
import TeamStats from "~/components/TeamStats";
import { TabsContent } from "~/components/ui/tabs";
import { getCurrentSeason } from "~/lib/seasons";
import { api, HydrateClient } from "~/trpc/server";

export default async function Team({
  params: { teamId: _teamId },
}: {
  params: { teamId: string };
}) {
  const teamId = parseInt(_teamId);
  const season = getCurrentSeason();

  await api.match.byTeamRecent.prefetch({ teamId, season });
  await api.user.byTeamPlayers.prefetch({ teamId });
  await api.user.byTeamViewers.prefetch({ teamId });
  await api.team.matchSettings.prefetch({ teamId });
  await api.stats.byTeamAndSeason.prefetch({ teamId, season });

  return (
    <HydrateClient>
      <TeamPageNavbar>
        <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-[calc(75px_+_1rem)] md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
          <TabsContent value="matches" className="col-span-2">
            <section className="flex w-full flex-col gap-4">
              <SeasonSelect />
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
              <SeasonSelect />
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                <TeamStats />
              </div>
            </section>
          </TabsContent>
          <TeamSettings />
        </main>
      </TeamPageNavbar>
    </HydrateClient>
  );
}
