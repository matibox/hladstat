import { redirect } from "next/navigation";
import React from "react";
import TeamContextProvider from "~/components/TeamContext";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function TeamLayout({
  children,
  nav,
  params: { teamId },
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();
  const { isInTeam, role } = await api.user.isInTeam({ teamId: parseInt(teamId) });

  if (!isInTeam || !session) redirect("/dashboard");

  await api.team.byId.prefetch({ teamId });

  return (
    <TeamContextProvider
      teamId={parseInt(teamId)}
      role={role}
      session={session}
    >
      <div className="flex flex-col">
        {nav}
        {children}
      </div>
    </TeamContextProvider>
  );
}
