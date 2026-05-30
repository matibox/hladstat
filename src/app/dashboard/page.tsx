import NewTeamForm from "~/components/NewTeamForm";
import TeamList from "~/components/TeamList";
import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  await api.team.ofUser.prefetch();

  // TODO: refactor the layout,
  // - sort teams by recent activity (last match played)
  // - group teams by archived status, archived teams should be collapsed by default
  // - add player card (display name and surname, last match played and it's stats)
  // - display total stats from all matches played by the player

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
