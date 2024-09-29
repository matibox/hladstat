"use client";

import { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { CopyIcon, Share2Icon } from "lucide-react";
import { api } from "~/trpc/react";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "~/hooks/useToast";
import { ToastAction } from "./ui/toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export default function ShareMatchDialog({
  matchId,
  isShared = false,
}: {
  matchId: number;
  isShared?: boolean;
}) {
  const { toast } = useToast();

  const [formOpened, setFormOpened] = useState(false);

  const matchURL =
    typeof window !== "undefined"
      ? `${window.location.host}/shared/${matchId}`
      : "";

  async function copyURL() {
    await window.navigator.clipboard.writeText(matchURL);
    toast({
      variant: "default",
      title: "Skopiowano link do schowka",
      description: matchURL,
    });
  }

  const utils = api.useUtils();
  const shareMatch = api.match.toggleShare.useMutation({
    onSuccess: async () => {
      setFormOpened(false);
      toast({
        variant: "default",
        title: !isShared ? "Udostępniono mecz" : "Cofnięto udostępnienie meczu",
        description: matchURL,
        action: !isShared ? (
          <ToastAction altText="Skopiuj link do schowka" onClick={copyURL}>
            Kopiuj
          </ToastAction>
        ) : undefined,
      });

      await utils.match.byId.invalidate();
    },
  });

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Share2Icon className="mr-2 h-4 w-4" />
          <span>Udostępnianie</span>
        </DropdownMenuItem>
      }
      title={!isShared ? "Udostępnij mecz" : "Cofnij udostępnienie meczu"}
      description={
        !isShared
          ? "Ten mecz zostanie udostępniony wszystkim osobom posiadającym link."
          : "Jesteś pewny? Cofnięcie udostępnienia spowoduje brak możliwości obejrzenia statystyk przez wszystkie osoby posiadające link."
      }
    >
      <div className="space-y-1">
        <span className="text-sm font-medium">Link do udostępnienia</span>
        <div className="flex gap-2">
          <Input disabled value={matchURL} className="disabled:cursor-text" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Kopiuj do schowka"
                  className="shrink-0"
                  onClick={copyURL}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kopiuj do schowka</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={shareMatch.isPending}
          onClick={() => setFormOpened(false)}
        >
          Anuluj
        </Button>
        <Button
          loading={shareMatch.isPending}
          onClick={() => shareMatch.mutate({ matchId, isShared })}
          variant={!isShared ? "default" : "destructive"}
        >
          {!isShared ? "Udostępnij" : "Cofnij udostępnienie"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
