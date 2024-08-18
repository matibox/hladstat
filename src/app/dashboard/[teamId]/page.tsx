import { ArrowRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCard from "~/components/MatchCard";
import PlayerCards from "~/components/PlayerCards";
import { Button, buttonVariants } from "~/components/ui/button";
import { PLACEHOLDER_MATCHES } from "~/lib/constants";
import { cn } from "~/lib/utils";
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

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:grid md:max-w-5xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        {/* matches */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
            <Link
              href={`/dashboard/${teamId}/matches/new`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <span>Nowy mecz</span>
              <PlusIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {PLACEHOLDER_MATCHES.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            <Button className="self-end" size="sm" variant="secondary">
              <span>Wszystkie mecze</span>
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
        {/* stats */}
        {/* <section></section> */}
        {/* players */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-semibold">Zawodnicy</h2>
            <AddPlayerForm teamId={parseInt(teamId)} />
          </div>
          <PlayerCards teamId={parseInt(teamId)} />
        </section>
        {/* settings/danger zone */}
        {/* <section></section> */}
      </main>
    </HydrateClient>
  );
}
