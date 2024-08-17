"use client";

import { UserIcon } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function Teams() {
  const [teams] = api.team.listMemberOf.useSuspenseQuery();

  return teams?.length === 0 ? (
    <p className="text-center">Nie należysz do żadnej drużyny.</p>
  ) : (
    teams?.map((team) => (
      <Link
        key={team.id}
        href={`/dashboard/${team.id}`}
        className="w-full max-w-96 rounded-md bg-muted p-4 transition-colors hover:bg-muted/85"
      >
        <div className="flex flex-col gap-1 leading-none">
          <span className="text-lg font-semibold">{team.name}</span>
          <div className="flex gap-1">
            <UserIcon className="h-4 w-4" />
            <span>{team.playerCount}</span>
          </div>
        </div>
      </Link>
    ))
  );
}
