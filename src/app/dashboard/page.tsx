import NewTeamForm from "~/components/NewTeamForm";
import Teams from "~/components/Teams";
import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  void api.team.listMemberOf.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 md:mx-auto md:w-full md:max-w-5xl">
        <h1 className="text-3xl font-bold leading-none">Drużyny</h1>
        <NewTeamForm />
        <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
          <Teams />
        </div>
      </main>
    </HydrateClient>
  );
}
