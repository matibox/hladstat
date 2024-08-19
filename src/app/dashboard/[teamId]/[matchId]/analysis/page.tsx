import dayjs from "dayjs";
import { CalendarIcon, SwordsIcon } from "lucide-react";
import AddStatisticForm from "~/components/AddStatisticForm";
import { PlayerCard } from "~/components/PlayerCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api, HydrateClient } from "~/trpc/server";

export default async function MatchAnalysis({
  params: { teamId: _teamId, matchId: _matchId },
}: {
  params: { teamId: string; matchId: string };
}) {
  const [teamId, matchId] = [_teamId, _matchId].map(Number) as [number, number];
  const match = await api.match.byId({ matchId });
  const setArray = [...new Array(match.numberOfSets).keys()].map((n) => n + 1);

  const players = await api.team.players({ teamId });

  return (
    <HydrateClient>
      <main className="relative mx-auto flex min-h-[200dvh] w-full max-w-xl flex-col gap-8 pb-4 md:max-w-5xl md:pb-6 lg:gap-12 lg:pb-8">
        <Tabs defaultValue={setArray[0]?.toString()}>
          <header className="sticky -top-10 left-0 flex flex-col items-center gap-4 border-b bg-background px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-semibold leading-none">
                {match.score}
              </h1>
              <div className="h-8 w-px bg-primary/20" />
              <div className="flex flex-col text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <SwordsIcon className="h-4 w-4" />
                  <span>{match.opponent}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{dayjs(match.date).format("DD.MM.YYYY")}</span>
                </div>
              </div>
            </div>
            <div className="sticky left-0 top-0 flex items-center gap-4 pb-4">
              {/* <span className="text-muted-foreground">Set</span> */}
              <TabsList>
                {setArray.map((setNumber) => (
                  <TabsTrigger key={setNumber} value={setNumber.toString()}>
                    {setNumber} set
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </header>
          <div className="flex flex-col gap-8 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
            <section className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold leading-none">Zawodnicy</h2>
              {setArray.map((setNumber) => (
                <TabsContent
                  key={setNumber}
                  value={setNumber.toString()}
                  className="mt-0"
                >
                  <div className="flex flex-col gap-4">
                    {players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        header={
                          <AddStatisticForm
                            set={setNumber}
                            player={player}
                            matchId={matchId}
                          />
                        }
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </section>
            <section>
              <h2 className="text-2xl font-semibold leading-none">
                Statystyki live
              </h2>
            </section>
          </div>
        </Tabs>
      </main>
    </HydrateClient>
  );
}
