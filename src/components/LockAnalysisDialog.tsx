"use client";

import { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { LockIcon, LockOpenIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/useToast";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { cn } from "~/lib/utils";

export default function LockAnalysisDialog({
  matchId,
  isLocked = false,
}: {
  matchId: number;
  isLocked?: boolean;
}) {
  const { toast } = useToast();

  const [formOpened, setFormOpened] = useState(false);

  const utils = api.useUtils();
  const lockMatchAnalysis = api.match.toggleAnalysisLock.useMutation({
    onSuccess: async () => {
      setFormOpened(false);
      toast({
        variant: "default",
        description: `${!isLocked ? "Zablokowano" : "Odblokowano"} analizę`,
      });

      await utils.match.byId.invalidate();
    },
  });

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className={cn({
            "text-red-500 focus:text-red-500": !isLocked,
          })}
        >
          {!isLocked ? (
            <LockIcon className="mr-2 h-4 w-4" />
          ) : (
            <LockOpenIcon className="mr-2 h-4 w-4" />
          )}
          <span>{!isLocked ? "Zablokuj" : "Odblokuj"} analizę</span>
        </DropdownMenuItem>
      }
      title={!isLocked ? "Zablokuj analizę" : "Odblokuj analizę"}
      description={
        !isLocked
          ? "Zablokowanie analizy uniemożliwi dodawanie statystyk. Funkcja ta może zapobiec przypadkowemu dodaniu nowych statystyk, gdy analiza meczu zostanie już zakończona."
          : "Odblokowanie analizy ponownie umożliwi dodawanie statystyk."
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={lockMatchAnalysis.isPending}
          onClick={() => setFormOpened(false)}
        >
          Anuluj
        </Button>
        <Button
          loading={lockMatchAnalysis.isPending}
          onClick={() => lockMatchAnalysis.mutate({ matchId, isLocked })}
          variant={!isLocked ? "destructive" : "default"}
        >
          {!isLocked ? "Zablokuj" : "Odblokuj"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
