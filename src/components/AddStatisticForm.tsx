"use client";

import React, { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { api, type RouterOutputs } from "~/trpc/react";
import { ClipboardPlusIcon } from "lucide-react";
import { statsOptions, type StatsCode } from "~/lib/constants";

export default function AddStatisticForm({
  matchId,
  set,
  player: { id: playerId, firstName, lastName, position, shirtNumber },
}: {
  matchId: number;
  set: number;
  player: RouterOutputs["team"]["players"][number];
}) {
  const [formOpened, setFormOpened] = useState(false);

  const addStats = api.stats.add.useMutation({
    onSuccess: () => {
      setFormOpened(false);
    },
  });

  function handleStatClick({ code }: { code: StatsCode }) {
    addStats.mutate({
      matchId,
      playerId,
      code,
      set,
    });
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
      title={`Dodaj statystykę - ${set} set`}
      description={`${firstName} ${lastName}, ${position}${shirtNumber ? `, nr ${shirtNumber}` : ""}`}
    >
      <div className="flex flex-col gap-4">
        {statsOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h2 className="font-semibold leading-none">{group.label}</h2>
            <div className="flex gap-2">
              {group.options.map((option) => (
                <Button
                  key={option.value}
                  variant={option.variant}
                  loading={addStats.isPending}
                  onClick={() =>
                    handleStatClick({
                      code: `${group.value}-${option.value}` as StatsCode,
                    })
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
