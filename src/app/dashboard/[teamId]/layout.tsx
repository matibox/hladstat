import { redirect } from "next/navigation";
import React from "react";
import TeamContextProvider from "~/components/TeamContext";
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
  const { isInTeam } = await api.user.isInTeam({ teamId: parseInt(teamId) });
  const { isOwner } = await api.user.isOwnerOfTeam({
    teamId: parseInt(teamId),
  });

  if (!isInTeam) redirect("/dashboard");

  return (
    <TeamContextProvider teamId={parseInt(teamId)} isOwner={isOwner}>
      <div className="flex flex-col">
        {nav}
        {children}
      </div>
    </TeamContextProvider>
  );
}
