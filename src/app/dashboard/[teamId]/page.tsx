import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCard from "~/components/MatchCard";
import PlayerCard from "~/components/PlayerCard";
import { Button } from "~/components/ui/button";
import { PLACEHOLDER_MATCHES, PLACEHOLDER_PLAYERS } from "~/lib/constants";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Team({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  return (
    <HydrateClient>
      <main className="flex flex-col gap-8 px-4 pb-4">
        {/* matches */}
        <section className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
            <Button size="sm" variant="secondary">
              <span>Nowy mecz</span>
              <PlusIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {PLACEHOLDER_MATCHES.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            <Button className="self-end" size="sm">
              <span>Wszystkie mecze</span>
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
        {/* stats */}
        <section></section>
        {/* players */}
        <section className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-semibold">Zawodnicy</h2>
            <AddPlayerForm />
          </div>
          <div className="flex flex-col gap-4">
            {PLACEHOLDER_PLAYERS.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
        {/* settings/danger zone */}
        <section></section>
      </main>
    </HydrateClient>
  );
}
