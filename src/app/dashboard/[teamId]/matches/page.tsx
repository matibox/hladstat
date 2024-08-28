import { MatchCard } from "~/components/MatchCards";
import { CardContent } from "~/components/ui/card";
import { api, HydrateClient } from "~/trpc/server";

export default async function AllMatchesPage({
  params: { teamId: _teamId },
}: {
  params: { teamId: string };
}) {
  const teamId = parseInt(_teamId);

  const matches = await api.team.allMatches({ teamId });

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        <div className="">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} teamId={teamId}>
              <CardContent className="p-4 pt-0">stats</CardContent>
            </MatchCard>
          ))}
        </div>
      </main>
    </HydrateClient>
  );
}
