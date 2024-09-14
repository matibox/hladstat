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
import { type RouterOutputs } from "~/trpc/react";
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

export function SetDistributionChart({ stats }: { stats: Stats }) {
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

export function PointsAndErrorsChart({ stats }: { stats: Stats }) {
  const {
    points,
    errors,
    chartData: pointsAndErrors,
    legend,
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
            config={legend}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="statType" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
              <Pie
                data={[...pointsAndErrors]}
                dataKey="quantity"
                nameKey="statType"
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

export function ScorersChart({ stats }: { stats: Stats }) {
  const { chartData: pointsByPlayer, legend } = countTeamPointsByPlayer(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">Punkty</CardTitle>
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

export function AttackChart({ stats }: { stats: Stats }) {
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
                data={[...attackStats]}
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

export function ReceptionChart({ stats }: { stats: Stats }) {
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
                data={[...receptionStats]}
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

export function ServeChart({ stats }: { stats: Stats }) {
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
                data={[...serveStats]}
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
