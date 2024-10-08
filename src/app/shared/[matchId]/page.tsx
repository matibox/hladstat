import MatchAnalysis from "~/components/MatchAnalysis";
import { api, HydrateClient } from "~/trpc/server";

export default async function MatchAnalysisPage({
  params: { matchId: _matchId },
}: {
  params: { matchId: string };
}) {
  const matchId = parseInt(_matchId);

  const match = await api.match.byId({ matchId });

  await api.user.byTeamPlayers.prefetch({ teamId: match.teamId! });
  await api.stats.byMatch.prefetch({ matchId, teamId: match.teamId! });

  return (
    <HydrateClient>
      <main className="relative mx-auto flex w-full flex-col gap-8 py-4 md:py-6 lg:max-w-[90vw] lg:gap-12 lg:py-8">
        <MatchAnalysis matchId={matchId} isShared={true} />
      </main>
    </HydrateClient>
  );
}
