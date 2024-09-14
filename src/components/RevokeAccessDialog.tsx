import { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";
import { api } from "~/trpc/react";

export default function RevokeAccessDialog({
  teamId,
  userId,
}: {
  teamId: number;
  userId: string;
}) {
  const [formOpened, setFormOpened] = useState(false);

  const utils = api.useUtils();
  const revokeAccess = api.team.revokeUserAccess.useMutation({
    onSuccess: async () => {
      await utils.team.shared.invalidate();
      setFormOpened(false);
    },
  });

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button variant="ghost" className="ml-auto h-auto w-auto p-2">
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      }
      tooltip="Odbierz dostęp"
      title="Jesteś pewny?"
      description="Czy na pewno chcesz odebrać dostęp tej osobie do statystyk? Nie będzie mogła już ona przeglądać statystyk twojej drużyny."
    >
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          disabled={revokeAccess.isPending}
          onClick={() => setFormOpened(false)}
        >
          Anuluj
        </Button>
        <Button
          variant="destructive"
          loading={revokeAccess.isPending}
          onClick={() => revokeAccess.mutate({ userId, teamId })}
        >
          Odbierz dostęp
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
