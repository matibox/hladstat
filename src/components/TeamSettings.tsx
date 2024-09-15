"use client";

import ShareAccessForm from "./ShareAccessForm";
import { TabsContent } from "./ui/tabs";
import { api } from "~/trpc/react";
import RevokeAccessDialog from "./RevokeAccessDialog";
import { useTeamContext } from "./TeamContext";

export default function TeamSettings() {
  const { teamId } = useTeamContext();
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
            {sharedToUsers.map((user) => (
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
    </TabsContent>
  );
}
