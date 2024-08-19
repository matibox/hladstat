"use client";

import React, { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button, type buttonVariants } from "./ui/button";
import { type RouterOutputs } from "~/trpc/react";
import { ClipboardPlusIcon } from "lucide-react";
import { type VariantProps } from "class-variance-authority";

const statsOptions = [
  {
    label: "Atak",
    value: "atk",
    options: [
      { label: "punkt", value: "kill", variant: "default" },
      { label: "podbity", value: "def", variant: "secondary" },
      { label: "błąd", value: "err", variant: "destructive" },
    ],
  },
  {
    label: "Przyjęcie",
    value: "rec",
    options: [
      { label: "perf.", value: "perf", variant: "default" },
      { label: "poz.", value: "pos", variant: "default" },
      { label: "neg", value: "neg", variant: "secondary" },
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
    options: [{ label: "blok", value: "blk", variant: "default" }],
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
type StatsCode = {
  [T in StatsOptions[number] as T["value"]]: `${T["value"]}-${T["options"][number]["value"]}`;
}[StatsOptions[number]["value"]];

export default function AddStatisticForm({
  teamId,
  matchId,
  player: { firstName, lastName, position, shirtNumber },
}: {
  teamId: number;
  matchId: number;
  player: RouterOutputs["team"]["players"][number];
}) {
  const [formOpened, setFormOpened] = useState(false);

  function handleStatClick(value: StatsCode) {
    console.log(value);
  }

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button size="icon" aria-label="Dodaj statystykę">
          <ClipboardPlusIcon className="h-5 w-5" />
        </Button>
      }
      title="Dodaj statystykę"
      description={`${firstName} ${lastName}, ${position}${shirtNumber ? `, nr ${shirtNumber}` : ""}`}
    >
      <div
        onClick={(e) => {
          const target = e.target as HTMLButtonElement;
          console.log(target.value);
        }}
        className="flex flex-col gap-4"
      >
        {statsOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h2 className="font-semibold leading-none">{group.label}</h2>
            <div className="flex gap-2">
              {group.options.map((option) => (
                <Button
                  key={option.value}
                  variant={option.variant}
                  onClick={() =>
                    handleStatClick(
                      `${group.value}-${option.value}` as StatsCode,
                    )
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ResponsiveDialog>
  );
}
