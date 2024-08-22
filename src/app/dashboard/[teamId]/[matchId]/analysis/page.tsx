import MatchAnalysis from "~/components/MatchAnalysis";
import { api, HydrateClient } from "~/trpc/server";

export default async function MatchAnalysisPage({
  params: { teamId: _teamId, matchId: _matchId },
}: {
  params: { teamId: string; matchId: string };
}) {
  const [teamId, matchId] = [_teamId, _matchId].map(Number) as [number, number];

  await api.match.byId.prefetch({ matchId });
  await api.team.players.prefetch({ teamId });
  await api.match.stats.prefetch({ matchId, teamId });

  return (
    <HydrateClient>
      <main className="relative mx-auto flex w-full max-w-xl flex-col gap-8 pb-4 md:max-w-5xl md:pb-6 lg:gap-12 lg:pb-8">
        <MatchAnalysis matchId={matchId} teamId={teamId} />
      </main>
    </HydrateClient>
  );
}
