import { type StatsCode } from "./constants";
import { formatPercentage, groupBy } from "./utils";

type Stats = Array<{ code: StatsCode }>;
type StatsWithPlayer = Array<{
  player: { name: string; position: string };
  code: StatsCode;
}>;

export function countStat<T extends Stats>(arr: T, codes: StatsCode[]) {
  return arr.reduce((sum, stat) => {
    if (codes.includes(stat.code)) return sum + 1;
    return sum;
  }, 0);
}

export function countSetDistribution<T extends StatsWithPlayer>(stats: T) {
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

export function countPointsAndErrors<T extends Stats>(stats: T) {
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

export function countTeamPointsByPlayer<T extends StatsWithPlayer>(stats: T) {
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

  const legend = Object.keys(statsByPlayer).reduce(
    (acc, playerName) => {
      const [firstName, lastName] = playerName.split(" ") as [string, string];

      return {
        ...acc,
        [playerName]: { label: `${firstName[0]}. ${lastName}` },
      };
    },
    {} as Record<string, { label: string }>,
  );

  return { chartData: data, legend };
}

export function countAttackStats<T extends Stats>(stats: T) {
  const kills = countStat(stats, ["atk-kill"]);
  const defended = countStat(stats, ["atk-def"]);
  const errors = countStat(stats, ["atk-err"]);

  const sum = kills + defended + errors;
  const perc = formatPercentage(kills / sum);
  const efficiency = formatPercentage((kills - errors) / sum);

  const data = [
    { attackType: "Skończone", quantity: kills },
    { attackType: "Obronione", quantity: defended },
    { attackType: "Błędy", quantity: errors },
  ];

  const legend = data.reduce(
    (acc, { attackType }) => {
      return { ...acc, [attackType]: { label: attackType } };
    },
    {} as Record<string, { label: string }>,
  );

  return { chartData: data, legend, perc, efficiency };
}

export function countReceptionStats<T extends Stats>(stats: T) {
  const perfect = countStat(stats, ["rec-perf"]);
  const positive = countStat(stats, ["rec-pos"]);
  const negative = countStat(stats, ["rec-neg"]);
  const errors = countStat(stats, ["rec-err"]);

  const sum = perfect + positive + negative + errors;
  const perfectPerc = formatPercentage(perfect / sum);
  const positivePerc = formatPercentage(positive / sum);

  const data = [
    { receptionType: "Perfekcyjne", quantity: perfect },
    { receptionType: "Pozytywne", quantity: positive },
    { receptionType: "Negatywne", quantity: negative },
    { receptionType: "Błędy", quantity: errors },
  ];

  const legend = data.reduce(
    (acc, { receptionType }) => {
      return { ...acc, [receptionType]: { label: receptionType } };
    },
    {} as Record<string, { label: string }>,
  );

  return { chartData: data, legend, perfectPerc, positivePerc };
}

export function countServeStats<T extends Stats>(stats: T) {
  const ace = countStat(stats, ["serve-ace"]);
  const positive = countStat(stats, ["serve-pos"]);
  const errors = countStat(stats, ["serve-err"]);

  const sum = ace + positive + errors;
  const acePerc = formatPercentage(ace / sum);

  const data = [
    { serveType: "As", quantity: ace },
    { serveType: "Pozytywny", quantity: positive },
    { serveType: "Błędy", quantity: errors },
  ];

  const legend = data.reduce(
    (acc, { serveType }) => {
      return { ...acc, [serveType]: { label: serveType } };
    },
    {} as Record<string, { label: string }>,
  );

  return { chartData: data, legend, acePerc };
}
