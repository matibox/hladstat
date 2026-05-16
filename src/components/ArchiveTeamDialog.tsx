"use client";

import { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";
import { useToast } from "~/hooks/useToast";

export default function ArchiveTeamDialog({
  isArchived,
}: {
  isArchived: boolean;
}) {
  const { teamId, session } = useTeamContext();
  const { toast } = useToast();
  const [formOpened, setFormOpened] = useState(false);

  const utils = api.useUtils();

  const handleSuccess = async (description: string) => {
    await utils.team.byId.invalidate();
    await utils.team.ofUser.invalidate();
    setFormOpened(false);
    toast({ title: "Sukces", description });
  };

  const handleError = (error: { message: string }) => {
    toast({
      variant: "destructive",
      title: "Błąd",
      description: error.message,
    });
  };

  const archiveTeam = api.team.archive.useMutation({
    onSuccess: () => handleSuccess("Drużyna została zarchiwizowana."),
    onError: handleError,
  });
  const unarchiveTeam = api.team.unarchive.useMutation({
    onSuccess: () => handleSuccess("Drużyna została odarchiwizowana."),
    onError: handleError,
  });

  const mutation = isArchived ? unarchiveTeam : archiveTeam;
  const userId = session?.user.id;

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button variant="secondary" size="sm" className="self-start">
          {isArchived ? (
            <ArchiveRestoreIcon className="mr-1.5 h-4 w-4" />
          ) : (
            <ArchiveIcon className="mr-1.5 h-4 w-4" />
          )}
          <span>
            {isArchived ? "Odarchiwizuj drużynę" : "Archiwizuj drużynę"}
          </span>
        </Button>
      }
      title={isArchived ? "Odarchiwizuj drużynę" : "Archiwizuj drużynę"}
      description={
        isArchived
          ? "Przywrócisz możliwość dodawania nowych meczów i statystyk. Wszystkie dotychczasowe dane pozostaną bez zmian."
          : "Drużyna zostanie ukryta z aktywnego użytkowania. Nie będzie można dodawać nowych meczów ani statystyk, ale istniejące dane zostaną zachowane."
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => setFormOpened(false)}
        >
          Anuluj
        </Button>
        <Button
          loading={mutation.isPending}
          disabled={!userId}
          onClick={() => {
            if (!userId) return;

            mutation.mutate({ userId, teamId });
          }}
        >
          {isArchived ? "Odarchiwizuj" : "Archiwizuj"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
