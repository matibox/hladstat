import { ArrowRightIcon, PlusIcon, SwordsIcon } from "lucide-react";
import { redirect } from "next/navigation";
import MatchCard from "~/components/MatchCard";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export const PLACEHOLDER_MATCHES = [
  {
    vs: "Humansport Kumple",
    score: "3:0",
    teamStats: {
      attackPerc: 47,
      posReceptionPerc: 56,
      blocks: 3,
      aces: 2,
    },
    date: new Date(),
  },
  {
    vs: "RMJ Księżyc",
    score: "3:2",
    teamStats: {
      attackPerc: 32,
      posReceptionPerc: 54,
      blocks: 2,
      aces: 0,
    },
    date: new Date(),
  },
].map((match, i) => ({ id: i, ...match }));

export default async function Team({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  return (
    <main className="px-4">
      {/* matches */}
      <section className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold">Ostatnie mecze</h1>
          <Button size="sm">
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
      <section></section>
      {/* settings/danger zone */}
    </main>
  );
}
