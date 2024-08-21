import { type StatsCode } from "./constants";
import { formatPercentage, groupBy } from "./utils";

type Stat = Array<{ code: StatsCode }>;
type StatWithPlayer = Array<{
  player: { name: string; position: string };
  code: StatsCode;
}>;

export function countStat<T extends Stat>(arr: T, codes: StatsCode[]) {
  return arr.reduce((sum, stat) => {
    if (codes.includes(stat.code)) return sum + 1;
    return sum;
  }, 0);
}

export function countSetDistribution<T extends StatWithPlayer>(stats: T) {
  const totalAttacks = countStat(stats, ["atk-kill", "atk-def", "atk-err"]);
  const groupedByPos = groupBy(stats, (stat) => stat.player.position);

  const data = Object.entries(groupedByPos)
    .map(([position, stats]) => {
      const attacksFraction =
        countStat(stats, ["atk-kill", "atk-def", "atk-err"]) / totalAttacks;

      return {
        position,
        distributionPerc: formatPercentage(attacksFraction),
      };
    })
    .filter((data) =>
      ["Atakujący", "Środkowy", "Przyjmujący"].includes(data.position),
    );

  return data;
}

export function countPointsAndErrors<T extends Stat>(stats: T) {
  const points = countStat(stats, ["atk-kill", "other-blk", "serve-ace"]);
  const errors = countStat(stats, [
    "atk-err",
    "rec-err",
    "serve-err",
    "other-err",
  ]);

  return {
    chartData: [
      { type: "Punkty", value: points },
      { type: "Błędy", value: errors },
    ],
    points,
    errors,
  };
}

export function countTeamPointsByPlayer<T extends StatWithPlayer>(stats: T) {
  const statsByPlayer = groupBy(stats, (stat) => stat.player.name);

  const data = Object.entries(statsByPlayer)
    .map(([playerName, stats]) => {
      const playerPoints = stats.filter((stat) =>
        ["atk-kill", "other-blk", "serve-ace"].includes(stat.code),
      ).length;

      return {
        player: playerName,
        points: playerPoints,
      };
    })
    .filter((el) => el.points !== 0)
    .sort((a, b) => b.points - a.points);

  const legend = Object.keys(statsByPlayer).reduce((acc, playerName) => {
    const [firstName, lastName] = playerName.split(" ") as [string, string];

    return {
      ...acc,
      [playerName]: { label: `${firstName[0]}. ${lastName}` },
    };
  }, {});

  return { chartData: data, legend };
}
