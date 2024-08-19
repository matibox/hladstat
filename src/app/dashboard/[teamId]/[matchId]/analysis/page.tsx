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
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:max-w-5xl md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        <Tabs defaultValue={setArray[0]?.toString()}>
          <div className="flex items-center justify-center gap-4 pb-2">
            <span>Set</span>
            <TabsList>
              {setArray.map((setNumber) => (
                <TabsTrigger key={setNumber} value={setNumber.toString()}>
                  {setNumber}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {setArray.map((setNumber) => (
            <TabsContent key={setNumber} value={setNumber.toString()}>
              <div className="flex flex-col gap-4">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    header={
                      <AddStatisticForm
                        set={setNumber}
                        player={player}
                        teamId={teamId}
                        matchId={matchId}
                      />
                    }
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </HydrateClient>
  );
}
