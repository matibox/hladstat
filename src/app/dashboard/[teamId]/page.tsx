import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import AddPlayerForm from "~/components/AddPlayerForm";
import MatchCard from "~/components/MatchCard";
import PlayerCard from "~/components/PlayerCard";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

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

export const PLACEHOLDER_PLAYERS = [
  {
    firstName: "Mateusz",
    lastName: "Hladky",
    position: "Przyjmujący",
    shirtNumber: 12,
    stats: {
      attackPerc: 45,
      posReceptionPerc: 54,
      blocks: 7,
      aces: 1,
      points: 27,
      matches: 2,
    },
  },
  {
    firstName: "Szymon",
    lastName: "Wlach",
    position: "Środkowy",
    shirtNumber: 10,
    stats: {
      attackPerc: 67,
      posReceptionPerc: 0,
      blocks: 13,
      aces: 1,
      points: 15,
      matches: 2,
    },
  },
].map((player, i) => ({ id: i, ...player }));

export default async function Team({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  return (
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
    </main>
  );
}
