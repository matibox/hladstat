import { statsOptions, type Position, type StatsCode } from "./constants";
import { formatPercentage, groupBy } from "./utils";

type Stats = Array<{ code: StatsCode }>;
type StatsWithPlayer = Array<{
  player: { name: string; position: Position };
  code: StatsCode;
}>;

export function statCodeToLabel(code: StatsCode) {
  const [group, action] = code.split("-") as [string, string];
  const foundStatGroup = statsOptions.find((stat) => stat.value === group);

  if (!foundStatGroup) return "inne";

  const foundStatOption = foundStatGroup.options.find(
    (option) => option.value === action,
  );

  if (!foundStatOption) return "inne";

  return `${foundStatGroup.label.toLowerCase()} - ${foundStatOption.label}`;
}

export function countStat<T extends Stats>(arr: T, codes: StatsCode[]) {
  return arr.reduce((sum, stat) => {
    if (codes.includes(stat.code)) return sum + 1;
    return sum;
  }, 0);
}

export function countSetDistribution<T extends StatsWithPlayer>(stats: T) {
  const totalAttacks = countStat(stats, [
    "atk-kill",
    "atk-def",
    "atk-err",
    "atk-blk",
  ]);
  const groupedByPos = groupBy(stats, (stat) => stat.player.position);
  const groupedByPlayer = groupBy(stats, (stat) => stat.player.name);

  const dataByPos = Object.entries(groupedByPos)
    .map(([position, stats]) => {
      const attacksFraction =
        countStat(stats, ["atk-kill", "atk-def", "atk-err", "atk-blk"]) /
        totalAttacks;

      return {
        position,
        distributionPerc: formatPercentage(attacksFraction),
      };
    })
    .filter((data) =>
      ["Atakujący", "Środkowy", "Przyjmujący"].includes(data.position),
    )
    .sort((_, { position }) => {
      if (position === "Przyjmujący") return 1;
      if (position === "Atakujący") return -1;
      return 0;
    });

  const dataByPlayer = Object.entries(groupedByPlayer)
    .filter(([_, stats]) =>
      stats.some((stat) =>
        ["Atakujący", "Środkowy", "Przyjmujący", "Nieokreślona"].includes(
          stat.player.position,
        ),
      ),
    )
    .map(([name, stats]) => {
      const attacksFraction =
        countStat(stats, ["atk-kill", "atk-def", "atk-err", "atk-blk"]) /
        totalAttacks;

      const playerPoints = countStat(stats, [
        "atk-kill",
        "other-blk",
        "serve-ace",
      ]);

      return {
        name,
        points: playerPoints,
        distributionPerc: formatPercentage(attacksFraction),
      };
    })
    .filter((stats) => stats.distributionPerc > 0)
    .sort((a, b) => b.distributionPerc - a.distributionPerc);

  const legendByPlayer = dataByPlayer.reduce(
    (acc, { name }) => {
      const [firstName, lastName] = name.split(" ") as [string, string];
      return { ...acc, [name]: { label: `${firstName[0]}.${lastName}` } };
    },
    {} as Record<string, { label: string }>,
  );

  return {
    chartDataByPos: dataByPos,
    chartDataByPlayer: dataByPlayer,
    legendByPlayer,
    totalAttacks,
  };
}

export function countPointsAndErrors<T extends Stats>(stats: T) {
  const pointsStats: Array<StatsCode> = [
    "atk-kill",
    "other-blk",
    "serve-ace",
  ] as const;

  const errorStats: Array<StatsCode> = [
    "atk-blk",
    "atk-err",
    "rec-err",
    "serve-err",
    "other-err",
  ] as const;

  const points = countStat(stats, pointsStats);
  const errors = countStat(stats, errorStats);

  const dataByType = [
    { statType: "Punkty", quantity: points, fill: "var(--chart-perf)" },
    { statType: "Błędy", quantity: errors, fill: "var(--chart-err)" },
  ] as const;

  const legendByType = dataByType.reduce(
    (acc, { statType }) => {
      return { ...acc, [statType]: { label: statType } };
    },
    {} as Record<string, { label: string }>,
  );

  let pointI = 0;
  let errI = 0;
  const dataWithDetails = [...pointsStats, ...errorStats].map((code) => {
    const isPoint = pointsStats.includes(code);
    isPoint ? pointI++ : errI++;
    return {
      statType: statCodeToLabel(code),
      quantity: countStat(stats, [code]),
      fill: `var(--chart-${isPoint ? "pos" : "err"}-${(isPoint ? pointI : errI) + 1})`,
    };
  });

  const legendWithDetails = dataWithDetails.reduce(
    (acc, { statType }) => {
      return { ...acc, [statType]: { label: statType } };
    },
    {} as Record<string, { label: string }>,
  );

  return {
    dataByType,
    dataWithDetails,
    legendByType,
    legendWithDetails,
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
        [playerName]: { label: `${firstName[0]}.${lastName}` },
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
  const blocked = countStat(stats, ["atk-blk"]);

  const sum = kills + defended + errors + blocked;
  const perc = formatPercentage(kills / sum);
  const efficiency = formatPercentage((kills - errors - blocked) / sum);

  const data = [
    { attackType: "Skończone", quantity: kills, fill: "var(--chart-perf)" },
    { attackType: "Obronione", quantity: defended, fill: "var(--chart-pos)" },
    { attackType: "Zablokowane", quantity: blocked, fill: "var(--chart-neg)" },
    { attackType: "Błędy", quantity: errors, fill: "var(--chart-err)" },
  ] as const;

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
  const positivePerc = formatPercentage((perfect + positive) / sum);

  const data = [
    {
      receptionType: "Perfekcyjne",
      quantity: perfect,
      fill: "var(--chart-perf)",
    },
    {
      receptionType: "Pozytywne",
      quantity: positive,
      fill: "var(--chart-pos)",
    },
    {
      receptionType: "Negatywne",
      quantity: negative,
      fill: "var(--chart-neg)",
    },
    { receptionType: "Błędy", quantity: errors, fill: "var(--chart-err)" },
  ] as const;

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
    { serveType: "As", quantity: ace, fill: "var(--chart-perf)" },
    { serveType: "Pozytywny", quantity: positive, fill: "var(--chart-pos)" },
    { serveType: "Błędy", quantity: errors, fill: "var(--chart-err)" },
  ] as const;

  const legend = data.reduce(
    (acc, { serveType }) => {
      return { ...acc, [serveType]: { label: serveType } };
    },
    {} as Record<string, { label: string }>,
  );

  return { chartData: data, legend, acePerc };
}
