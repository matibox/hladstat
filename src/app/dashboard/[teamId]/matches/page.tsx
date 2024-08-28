import { MatchCard } from "~/components/MatchCards";
import NewMatchForm from "~/components/NewMatchForm";
import { CardContent } from "~/components/ui/card";
import {
  countAttackStats,
  countPointsAndErrors,
  countReceptionStats,
  countStat,
} from "~/lib/stats";
import { api, HydrateClient } from "~/trpc/server";

export default async function AllMatchesPage({
  params: { teamId: _teamId },
}: {
  params: { teamId: string };
}) {
  const teamId = parseInt(_teamId);

  const matches = await api.team.allMatchesWithStats({ teamId });

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-4 pb-4 md:max-w-7xl md:px-6 md:pb-6 lg:px-8 lg:pb-8">
        <NewMatchForm teamId={teamId} />
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {matches.map(({ stats, ...match }) => {
            const { points, errors } = countPointsAndErrors(stats);
            const { perc: atkPerc } = countAttackStats(stats);
            const { positivePerc: recPosPerc, perfectPerc: recPerfPerc } =
              countReceptionStats(stats);
            const aces = countStat(stats, ["serve-ace"]);
            const blocks = countStat(stats, ["other-blk"]);
            const digs = countStat(stats, ["other-dig"]);

            const statsDisplay = [
              { label: "Punkty/Błędy", value: `${points}/${errors}` },
              {
                label: "Przyjęcie perf./poz.",
                value: `${recPerfPerc}%/${recPosPerc}%`,
              },
              { label: "Atak", value: `${atkPerc}%` },
              { label: "Asy", value: aces },
              { label: "Bloki", value: blocks },
              { label: "Obrony", value: digs },
            ];

            return (
              <MatchCard key={match.id} match={match} teamId={teamId}>
                <CardContent className="hidden p-4 pt-0 lg:block">
                  {stats.length === 0 ? (
                    <p className="leading-none text-muted-foreground">
                      Brak statystyk.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-x-8 gap-y-4 leading-none">
                      {statsDisplay.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center gap-2.5"
                        >
                          <span className="text-muted-foreground">
                            {stat.label}
                          </span>
                          <span>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </MatchCard>
            );
          })}
        </div>
      </main>
    </HydrateClient>
  );
}
