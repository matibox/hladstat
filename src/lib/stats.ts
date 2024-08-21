import { type StatsCode } from "./constants";
import { groupBy } from "./utils";

export function countStat<T extends Array<{ code: StatsCode }>>(
  arr: T,
  codes: StatsCode[],
) {
  return arr.reduce((sum, stat) => {
    if (codes.includes(stat.code)) return sum + 1;
    return sum;
  }, 0);
}

export function countSetDistribution<
  T extends Array<{ player: { position: string }; code: StatsCode }>,
>(stats: T) {
  const totalAttacks = countStat(stats, ["atk-kill", "atk-def", "atk-err"]);
  const groupedByPos = groupBy(stats, (stat) => stat.player.position);

  const data = Object.entries(groupedByPos)
    .map(([position, stats]) => {
      const attacksFraction =
        countStat(stats, ["atk-kill", "atk-def", "atk-err"]) / totalAttacks;

      return {
        position,
        distributionPerc: Math.round(attacksFraction * 100),
      };
    })
    .filter((data) =>
      ["Atakujący", "Środkowy", "Przyjmujący"].includes(data.position),
    );

  return data;
}

export function countPointsAndErrors<T extends Array<{ code: StatsCode }>>(
  stats: T,
) {
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
