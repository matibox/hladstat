"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  countPointsAndErrors,
  countTeamPointsByPlayer,
  countSetDistribution,
  countAttackStats,
  countReceptionStats,
  countServeStats,
} from "~/lib/stats";
import { colorizeChart } from "~/lib/utils";

type Stats = RouterOutputs["match"]["stats"];

export default function MatchStats({
  matchId,
  teamId,
  set,
}: {
  matchId: number;
  teamId: number;
  set: number;
}) {
  const [stats] = api.match.stats.useSuspenseQuery({ teamId, matchId });

  const statsBySet = stats.filter((stat) => stat.set === set);

  return (
    <>
      <ScorersChart stats={statsBySet} />
      <SetDistributionChart stats={statsBySet} />
      <PointsAndErrorsChart stats={statsBySet} />
      <AttackChart stats={statsBySet} />
      <ReceptionChart stats={statsBySet} />
      <ServeChart stats={statsBySet} />
    </>
  );
}

function SetDistributionChart({ stats }: { stats: Stats }) {
  const setDistribution = countSetDistribution(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">
          Dystrybucja rozegrania
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {setDistribution.length === 0 ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer config={{ tooltip: { label: "%" } }}>
            <BarChart
              data={colorizeChart(setDistribution)}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="tooltip" />}
              />
              <XAxis
                dataKey="position"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Bar dataKey="distributionPerc" radius={6}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(v: number) => `${v}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function PointsAndErrorsChart({ stats }: { stats: Stats }) {
  const {
    points,
    errors,
    chartData: pointsAndErrors,
  } = countPointsAndErrors(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl leading-none">Pkt/Błędy</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {pointsAndErrors.every((stat) => stat.quantity === 0) ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer
            config={{}}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pointsAndErrors.map((data, i) => {
                  let fill = `hsl(var(--chart-${(i % 5) + 1}))`;
                  if (data.type === "Punkty") fill = "hsl(var(--chart-2))";
                  if (data.type === "Błędy") fill = "hsl(var(--chart-5))";
                  return { ...data, fill };
                })}
                dataKey="quantity"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {points}/{errors}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Pkt/Błędy
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ScorersChart({ stats }: { stats: Stats }) {
  const { chartData: pointsByPlayer, legend } = countTeamPointsByPlayer(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">Punkty drużyny</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {pointsByPlayer.length === 0 ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer
            config={legend}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="player" />}
              />
              <Pie data={colorizeChart(pointsByPlayer)} dataKey="points" />
              <ChartLegend
                content={<ChartLegendContent nameKey="player" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function AttackChart({ stats }: { stats: Stats }) {
  const { chartData: attackStats, legend, perc } = countAttackStats(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">Atak</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {attackStats.every((stat) => stat.quantity === 0) ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer
            config={legend}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="attackType" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
              <Pie
                data={attackStats.map((data, i) => {
                  const { attackType } = data;
                  let fill = `hsl(var(--chart-${(i % 5) + 1}))`;
                  if (attackType === "Skończone") fill = "hsl(var(--chart-2))";
                  if (attackType === "Obronione") fill = "hsl(var(--chart-1))";
                  if (attackType === "Błędy") fill = "hsl(var(--chart-5))";
                  return { ...data, fill };
                })}
                dataKey="quantity"
                nameKey="attackType"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {perc}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            w ataku
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ReceptionChart({ stats }: { stats: Stats }) {
  const {
    chartData: receptionStats,
    legend,
    perfectPerc,
    positivePerc,
  } = countReceptionStats(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">Przyjęcie</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {receptionStats.every((stat) => stat.quantity === 0) ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer
            config={legend}
            className="mx-auto aspect-square max-h-[270px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="receptionType" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
              <Pie
                data={receptionStats.map((data, i) => {
                  const { receptionType } = data;
                  let fill = `hsl(var(--chart-${(i % 5) + 1}))`;
                  if (receptionType === "Perfekcyjne")
                    fill = "hsl(var(--chart-2))";
                  if (receptionType === "Pozytywne")
                    fill = "hsl(var(--chart-1))";
                  if (receptionType === "Negatywne")
                    fill = "hsl(var(--chart-3))";
                  if (receptionType === "Błędy") fill = "hsl(var(--chart-5))";
                  return { ...data, fill };
                })}
                dataKey="quantity"
                nameKey="receptionType"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {perfectPerc}/{positivePerc}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            % perf./poz.
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ServeChart({ stats }: { stats: Stats }) {
  const { chartData: serveStats, legend, acePerc } = countServeStats(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">Zagrywka</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {serveStats.every((stat) => stat.quantity === 0) ? (
          <p className="text-center text-muted-foreground">Brak danych.</p>
        ) : (
          <ChartContainer
            config={legend}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="serveType" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
              <Pie
                data={serveStats.map((data, i) => {
                  const { serveType } = data;
                  let fill = `hsl(var(--chart-${(i % 5) + 1}))`;
                  if (serveType === "As") fill = "hsl(var(--chart-2))";
                  if (serveType === "Pozytywny") fill = "hsl(var(--chart-1))";
                  if (serveType === "Błędy") fill = "hsl(var(--chart-5))";
                  return { ...data, fill };
                })}
                dataKey="quantity"
                nameKey="serveType"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {acePerc}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            asów
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
