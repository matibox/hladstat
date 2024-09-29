"use client";

import React, { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { api, type RouterOutputs } from "~/trpc/react";
import { ClipboardPlusIcon, Loader2Icon, LockIcon } from "lucide-react";
import { statsOptions, type StatsCode } from "~/lib/constants";
import { useToast } from "~/hooks/useToast";
import { ToastAction } from "./ui/toast";
import { statCodeToLabel } from "~/lib/stats";
import { cn } from "~/lib/utils";

export default function AddStatisticForm({
  matchId,
  set,
  player: { id: playerId, firstName, lastName, position, shirtNumber },
  lockedAnalysis = false,
}: {
  matchId: number;
  set: number;
  player: RouterOutputs["team"]["players"][number];
  lockedAnalysis?: boolean;
}) {
  const [formOpened, setFormOpened] = useState(false);
  const { toast } = useToast();

  const utils = api.useUtils();

  const deleteStat = api.stats.delete.useMutation({
    onSuccess: async ({ code }) => {
      await utils.match.stats.invalidate();
      await utils.match.playerStats.invalidate();

      toast({
        title: "Cofnięto dodanie statystyki.",
        description: `${firstName} ${lastName}: ${statCodeToLabel(code)}`,
      });
    },
  });

  const addStats = api.stats.addToPlayer.useMutation({
    onSuccess: async ({ id, code }) => {
      await utils.match.stats.invalidate();
      await utils.match.playerStats.invalidate();
      setFormOpened(false);

      toast({
        title: "Dodano statystykę.",
        description: `${firstName} ${lastName}: ${statCodeToLabel(code)}`,
        action: (
          <ToastAction altText="cofnij" asChild>
            <button onClick={() => deleteStat.mutate({ statId: id })}>
              Cofnij
            </button>
          </ToastAction>
        ),
      });
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
        <Button
          size="icon"
          aria-label="Dodaj statystykę"
          className={cn("ml-3", {
            relative: lockedAnalysis,
          })}
          disabled={lockedAnalysis}
        >
          {lockedAnalysis && (
            <div className="absolute -right-2 -top-2 flex items-center justify-center rounded-full bg-red-500 p-1">
              <LockIcon className="h-3 w-3" />
            </div>
          )}
          <ClipboardPlusIcon className="h-5 w-5" />
        </Button>
      }
      tooltip="Dodaj statystykę"
      title={`Dodaj statystykę - ${set} set`}
      description={`${firstName} ${lastName}, ${position}${shirtNumber ? `, nr ${shirtNumber}` : ""}`}
    >
      <div className="relative flex flex-col gap-4">
        <div
          className="absolute -left-1 top-0 flex h-full w-full items-center justify-center bg-background/90 transition-opacity"
          style={
            addStats.isPending
              ? { opacity: "100", visibility: "visible" }
              : { opacity: "0", visibility: "hidden" }
          }
        >
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        {statsOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h2 className="font-semibold leading-none">{group.label}</h2>
            <div className="flex gap-2">
              {group.options.map((option) => (
                <Button
                  key={option.value}
                  variant={option.variant}
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
