"use client";

import { TrashIcon } from "lucide-react";
import ShareAccessForm from "./ShareAccessForm";
import { Button } from "./ui/button";
import { TabsContent } from "./ui/tabs";
import { api } from "~/trpc/react";

export default function TeamSettings({ teamId }: { teamId: number }) {
  const [sharedToUsers] = api.team.shared.useSuspenseQuery({ teamId });

  return (
    <TabsContent value="settings">
      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold leading-none">
            Udostępniony dostęp
          </h2>
          <p className="text-sm text-muted-foreground">
            Lista osób, które mogą zobaczyć statystyki meczów oraz zawodników.
          </p>
        </div>
        {sharedToUsers.length > 0 && (
          <div className="flex flex-col gap-1">
            {sharedToUsers.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <div className="h-6 w-px bg-muted" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium leading-none">
                    {player.firstName} {player.lastName}
                  </span>
                </div>
                <Button variant="ghost" className="ml-auto h-auto w-auto p-2">
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <ShareAccessForm teamId={teamId} />
      </section>
    </TabsContent>
  );
}
