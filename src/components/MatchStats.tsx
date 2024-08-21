"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { type positions } from "~/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const chartConfig = {
  perc: { label: "%", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const SET_DRISTRIBUTION_PLACEHOLDER = [
  { position: "Przyjmujący", perc: 51 },
  { position: "Środkowy", perc: 15 },
  { position: "Atakujący", perc: 44 },
] satisfies Array<{ position: (typeof positions)[number]; perc: number }>;

export default function MatchStats() {
  return (
    <Card className="w-full border-none bg-muted/25">
      <CardHeader className="p-4">
        <CardTitle className="text-xl leading-none">
          Dystrybucja rozegrania
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={chartConfig}>
          <BarChart data={SET_DRISTRIBUTION_PLACEHOLDER}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <XAxis
              dataKey="position"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              width={32}
              dataKey="perc"
              tickLine={false}
              axisLine={false}
              tickFormatter={(perc: number) => `${perc}%`}
            />
            <Bar dataKey="perc" fill="var(--color-perc)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
