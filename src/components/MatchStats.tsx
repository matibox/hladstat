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
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import { countPointsAndErrors, countSetDistribution } from "~/lib/stats";

type Stats = RouterOutputs["match"]["stats"];

export default function MatchStats({
  matchId,
  teamId,
}: {
  matchId: number;
  teamId: number;
}) {
  const [stats] = api.match.stats.useSuspenseQuery({ teamId, matchId });

  return (
    <>
      <SetDistributionChart stats={stats} />
      <PointsAndErrorsChart stats={stats} />
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
        <ChartContainer config={{ tooltip: { label: "%" } }}>
          <BarChart
            data={setDistribution.map((data, i) => ({
              ...data,
              fill: `hsl(var(--chart-${i + 1}))`,
            }))}
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
      </CardContent>
    </Card>
  );
}

function PointsAndErrorsChart({ stats }: { stats: Stats }) {
  const { points, errors, chartData } = countPointsAndErrors(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardContent className="p-0">
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
              data={chartData.map((data, i) => {
                let fill = `hsl(var(--chart-${i + 1}))`;
                if (i == 0) fill = "hsl(var(--chart-2))";
                if (i == 1) fill = "hsl(var(--chart-5))";
                return { ...data, fill };
              })}
              dataKey="value"
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
      </CardContent>
    </Card>
  );
}
