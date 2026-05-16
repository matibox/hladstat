import NewTeamForm from "~/components/NewTeamForm";
import TeamList from "~/components/TeamList";
import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  await api.team.ofUser.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 md:mx-auto md:w-full md:max-w-5xl">
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Drużyny</h1>
            <NewTeamForm />
          </div>
          <TeamList />
        </section>
      </main>
    </HydrateClient>
  );
}
