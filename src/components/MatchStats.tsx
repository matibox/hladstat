"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { api } from "~/trpc/react";
import { countSetDistribution } from "~/lib/stats";

const chartConfig = {
  perc: { label: "%" },
  "pos-0": { label: "Przyjmujący", color: "hsl(var(--chart-1))" },
  "pos-1": { label: "Środkowy", color: "hsl(var(--chart-2))" },
  "pos-2": { label: "Atakujący", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export default function MatchStats({
  matchId,
  teamId,
}: {
  matchId: number;
  teamId: number;
}) {
  const [stats] = api.match.stats.useSuspenseQuery({ teamId, matchId });

  const setDistribution = countSetDistribution(stats);

  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">
          Dystrybucja rozegrania
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={chartConfig}>
          <BarChart
            data={setDistribution.map((data, i) => ({
              ...data,
              fill: `var(--color-pos-${i})`,
            }))}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="perc" />}
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
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
