import { redirect } from "next/navigation";
import React from "react";
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

  if (!isInTeam) redirect("/dashboard");

  return (
    <div className="flex flex-col">
      {nav}
      {children}
    </div>
  );
}
