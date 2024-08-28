import { redirect } from "next/navigation";
import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCards from "~/components/MatchCards";
import NewMatchForm from "~/components/NewMatchForm";
import TeamPlayers from "~/components/PlayerCards";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Team({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  await api.team.players.prefetch({ teamId: parseInt(teamId) });
  await api.team.recentMatches.prefetch({ teamId: parseInt(teamId) });

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        {/* matches */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
            <NewMatchForm teamId={parseInt(teamId)} />
          </div>
          <MatchCards teamId={parseInt(teamId)} />
        </section>
        {/* stats */}
        {/* <section></section> */}
        {/* players */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-semibold">Zawodnicy</h2>
            <AddPlayerForm teamId={parseInt(teamId)} />
          </div>
          <TeamPlayers teamId={parseInt(teamId)} />
        </section>
        {/* settings/danger zone */}
        {/* <section></section> */}
      </main>
    </HydrateClient>
  );
}
