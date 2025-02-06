"use client";

import ShareAccessForm from "./ShareAccessForm";
import { TabsContent } from "./ui/tabs";
import { api } from "~/trpc/react";
import RevokeAccessDialog from "./RevokeAccessDialog";
import { useTeamContext } from "./TeamContext";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { SaveIcon } from "lucide-react";
import { useToast } from "~/hooks/useToast";
import { useState } from "react";

export default function TeamSettings() {
  const { toast } = useToast();
  const { teamId } = useTeamContext();
  const [viewers] = api.user.byTeamViewers.useSuspenseQuery({ teamId });
  const [matchSettings] = api.team.matchSettings.useSuspenseQuery({ teamId });

  const [checked, setIsCheked] = useState(
    matchSettings.allowTwoSetMatches ?? false,
  );

  const utils = api.useUtils();
  const saveMatchSettings = api.team.saveMatchSettings.useMutation({
    onSuccess: async () => {
      await utils.team.matchSettings.invalidate();
      toast({
        title: "Sukces",
        description: "Zapisano ustawienia meczów.",
      });
    },
  });

  return (
    <TabsContent value="settings" className="flex flex-col gap-8">
      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold leading-none">
            Udostępniony dostęp
          </h2>
          <p className="text-sm text-muted-foreground">
            Lista osób, które mogą zobaczyć statystyki meczów oraz zawodników.
          </p>
        </div>
        {viewers.length > 0 && (
          <div className="flex flex-col gap-1">
            {viewers.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <div className="h-6 w-px bg-muted" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <RevokeAccessDialog userId={user.id} />
              </div>
            ))}
          </div>
        )}
        <ShareAccessForm />
      </section>
      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold leading-none">Mecze</h2>
          <p className="text-sm text-muted-foreground">Ustawienia meczów.</p>
        </div>
        <div className="items-top flex gap-2">
          <Checkbox
            id="allowTwoSetMatches"
            checked={checked}
            onCheckedChange={(checked) => setIsCheked(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="allowTwoSetMatches"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ignoruj sprawdzanie wyniku meczu
            </label>
            <p className="text-sm text-muted-foreground">
              Dzięki temu ustawieniu można wpisać niestandardowy wynik meczu,
              np. 2:0
            </p>
          </div>
        </div>
        <Button
          className="self-start"
          size="sm"
          loading={saveMatchSettings.status === "pending"}
          onClick={() => {
            if (checked === matchSettings.allowTwoSetMatches) return;

            saveMatchSettings.mutate({
              teamId,
              allowTwoSetMatches: checked,
            });
          }}
        >
          <span>Zapisz</span>
          <SaveIcon className="ml-1.5 h-4 w-4" />
        </Button>
      </section>
    </TabsContent>
  );
}
