"use client";

import { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { CheckIcon, RotateCcwIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/useToast";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { cn } from "~/lib/utils";

export default function ResetStatsDialog({
  matchId,
  numberOfSets,
  isDisabled = false,
}: {
  matchId: number;
  numberOfSets: number;
  isDisabled?: boolean;
}) {
  const { toast } = useToast();

  const [formOpened, setFormOpened] = useState(false);
  const [checkedSets, setCheckedSets] = useState(
    new Array(numberOfSets).fill(false) as Array<boolean>,
  );

  const utils = api.useUtils();
  const resetStats = api.stats.deleteByMatchIdAndSet.useMutation({
    onSuccess: async ({ sets }) => {
      setFormOpened(false);
      toast({
        variant: "default",
        title: "Pomyślnie zresetowano statystyki",
        description: `Zresetowano dla ${sets.length === numberOfSets ? "całego meczu" : `setów: ${sets.join(", ")}`}`,
      });

      await utils.stats.byMatch.invalidate();
      await utils.stats.byMatchPlayer.invalidate();
    },
  });

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-500 focus:text-red-500"
          disabled={isDisabled}
        >
          <RotateCcwIcon className="mr-2 h-4 w-4" />
          <span>Zresetuj statystyki</span>
        </DropdownMenuItem>
      }
      title="Zresetuj statystyki"
      description="Usuń wszystkie statystyki z wybranych setów."
    >
      <div className="space-y-2">
        <span className="text-sm font-medium">Wybierz sety</span>
        <div
          className="grid w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${numberOfSets}, minmax(0, 1fr))`,
          }}
        >
          {[...new Array(numberOfSets).keys()]
            .map((n) => n + 1)
            .map((set) => (
              <Button
                key={set}
                className={cn("group relative h-16 w-full", {
                  "border-muted-foreground": checkedSets[set - 1],
                })}
                variant="outline"
                onClick={() =>
                  setCheckedSets((prev) =>
                    prev.map((checked, i) =>
                      i === set - 1 ? !checked : checked,
                    ),
                  )
                }
              >
                {checkedSets[set - 1] ? (
                  <>
                    <CheckIcon className="left-2 top-2 h-5 w-5 text-muted-foreground group-hover:hidden" />
                    <span className="hidden text-muted-foreground group-hover:block">
                      {set}
                    </span>
                  </>
                ) : (
                  <span className="">{set}</span>
                )}
              </Button>
            ))}
        </div>
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() =>
            setCheckedSets((prev) =>
              prev.map(() => !checkedSets.every((isChecked) => isChecked)),
            )
          }
        >
          {checkedSets.every((isChecked) => isChecked) ? "Odznacz" : "Zaznacz"}{" "}
          wszystkie
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={resetStats.isPending}
          onClick={() => setFormOpened(false)}
        >
          Anuluj
        </Button>
        <Button
          disabled={checkedSets.every((isChecked) => !isChecked)}
          loading={resetStats.isPending}
          onClick={() =>
            resetStats.mutate({
              matchId,
              sets: checkedSets
                .map((isSetChecked, i) => (isSetChecked ? i + 1 : -1))
                .filter((v) => v > 0),
            })
          }
          variant="destructive"
        >
          Resetuj
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
