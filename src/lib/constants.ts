import { type VariantProps } from "class-variance-authority";
import { type buttonVariants } from "~/components/ui/button";

export const roles = ["owner", "player", "shared"] as const;

export const positions = [
  "Przyjmujący",
  "Rozgrywający",
  "Atakujący",
  "Środkowy",
  "Libero",
  "Nieokreślona",
] as const;

export const statsOptions = [
  {
    label: "Atak",
    value: "atk",
    options: [
      { label: "punkt", value: "kill", variant: "default" },
      { label: "podbity", value: "def", variant: "outline" },
      { label: "blok", value: "blk", variant: "destructive" },
      { label: "błąd", value: "err", variant: "destructive" },
    ],
  },
  {
    label: "Przyjęcie",
    value: "rec",
    options: [
      { label: "perf.", value: "perf", variant: "default" },
      { label: "poz.", value: "pos", variant: "secondary" },
      { label: "neg.", value: "neg", variant: "outline" },
      { label: "błąd", value: "err", variant: "destructive" },
    ],
  },
  {
    label: "Zagrywka",
    value: "serve",
    options: [
      { label: "as", value: "ace", variant: "default" },
      { label: "poz.", value: "pos", variant: "secondary" },
      { label: "błąd", value: "err", variant: "destructive" },
    ],
  },
  {
    label: "Inne",
    value: "other",
    options: [
      { label: "blok", value: "blk", variant: "default" },
      { label: "obrona", value: "dig", variant: "default" },
      { label: "błąd", value: "err", variant: "destructive" },
    ],
  },
] as const satisfies Array<{
  label: string;
  value: string;
  options: Array<{
    label: string;
    value: string;
    variant: VariantProps<typeof buttonVariants>["variant"];
  }>;
}>;

type StatsOptions = typeof statsOptions;
export type StatsCode = {
  [T in StatsOptions[number] as T["value"]]: `${T["value"]}-${T["options"][number]["value"]}`;
}[StatsOptions[number]["value"]];
