import { redirect } from "next/navigation";
import NewTeamForm from "~/components/NewTeamForm";
import Teams from "~/components/Teams";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  void api.team.listMemberOf.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
        <h1 className="text-3xl font-bold leading-none">Drużyny</h1>
        <NewTeamForm />
        <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
          <Teams />
        </div>
      </main>
    </HydrateClient>
  );
}
