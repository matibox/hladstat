import MatchAnalysis from "~/components/MatchAnalysis";
import { api, HydrateClient } from "~/trpc/server";

export default async function MatchAnalysisPage({
  params: { matchId: _matchId },
}: {
  params: { matchId: string };
}) {
  const matchId = parseInt(_matchId);

  const match = await api.match.byId({ matchId });
  await api.team.players.prefetch({ teamId: match.teamId! });
  await api.match.stats.prefetch({ matchId, teamId: match.teamId! });

  return (
    <HydrateClient>
      <main className="relative mx-auto flex w-full flex-col gap-8 pb-4 md:pb-6 lg:max-w-[90vw] lg:gap-12 lg:pb-8">
        <MatchAnalysis matchId={matchId} isShared={true} />
      </main>
    </HydrateClient>
  );
}
