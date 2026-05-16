"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { TrashIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";
import { useToast } from "~/hooks/useToast";

export default function DeleteTeamDialog({ teamName }: { teamName: string }) {
  const { teamId } = useTeamContext();
  const router = useRouter();
  const { toast } = useToast();
  const [formOpened, setFormOpened] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const utils = api.useUtils();
  const deleteTeam = api.team.delete.useMutation({
    onSuccess: async () => {
      await utils.team.ofUser.invalidate();
      setFormOpened(false);
      setConfirmation("");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: error.message,
      });
    },
  });

  const isConfirmed = confirmation === teamName;

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={(open) => {
        setFormOpened(open);
        if (!open) setConfirmation("");
      }}
      trigger={
        <Button variant="destructive" size="sm" className="self-start">
          <TrashIcon className="mr-1.5 h-4 w-4" />
          <span>Usuń drużynę</span>
        </Button>
      }
      title="Usuń drużynę"
      description="Ta operacja jest nieodwracalna. Wszystkie mecze, statystyki i powiązania zawodników z drużyną zostaną trwale usunięte."
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="delete-team-confirmation">
            Wpisz <span className="font-semibold">{teamName}</span>, aby
            potwierdzić
          </Label>
          <Input
            id="delete-team-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={teamName}
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            disabled={deleteTeam.isPending}
            onClick={() => setFormOpened(false)}
          >
            Anuluj
          </Button>
          <Button
            variant="destructive"
            loading={deleteTeam.isPending}
            disabled={!isConfirmed}
            onClick={() =>
              deleteTeam.mutate({
                teamId,
                name: confirmation,
              })
            }
          >
            Usuń
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
