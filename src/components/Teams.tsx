"use client";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { UserIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { AvatarFallback } from "./ui/avatar";

export default function Teams() {
  const [teams] = api.team.listMemberOf.useSuspenseQuery();

  return teams?.length === 0 ? (
    <p className="col-span-full text-center">Nie należysz do żadnej drużyny.</p>
  ) : (
    teams?.map((team) => (
      <Link
        key={team.id}
        href={`/dashboard/${team.id}`}
        className="flex w-full max-w-96 items-center gap-4 rounded-md bg-muted p-2 transition-colors hover:bg-muted/85"
      >
        <Avatar>
          <AvatarImage
            src={team.profilePicture ?? undefined}
            alt={`${team.name} - logo`}
            className="h-16 w-16 rounded-md object-cover"
          />
          <AvatarFallback className="h-16 w-16 rounded-md bg-primary-foreground">
            <UsersIcon className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
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
