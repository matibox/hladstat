import NewTeamForm from "~/components/NewTeamForm";
import TeamCard from "~/components/TeamCard";
import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  const teams = await api.user.teams();
  const sharedTeams = await api.user.sharedTeams();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 md:mx-auto md:w-full md:max-w-5xl">
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-semibold">Drużyny</h1>
            <NewTeamForm />
          </div>
          <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
            {teams.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                Nie należysz do żadnej drużyny.
              </p>
            ) : (
              teams.map((team) => <TeamCard key={team.id} team={team} />)
            )}
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <h2 className="text-2xl font-semibold">Udostępnione drużyny</h2>
          <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
            {sharedTeams.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                Nie udostępniono ci dostępu do żadnej drużyny.
              </p>
            ) : (
              sharedTeams.map((team) => <TeamCard key={team.id} team={team} />)
            )}
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
