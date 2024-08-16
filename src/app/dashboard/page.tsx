import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

const teams = [{ name: "Sparta Skoczów" }, { name: "Szybin" }].map(
  (team, i) => ({ id: i, ...team }),
);

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
      <h1 className="text-3xl font-bold leading-none">Drużyny</h1>
      <Button>Nowa drużyna</Button>
      <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/${team.id}`}
            className="w-full max-w-96 rounded-md bg-muted p-4 transition-colors hover:bg-muted/85"
          >
            <span className="font-semibold leading-none">{team.name}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
