import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserIcon, UsersIcon } from "lucide-react";

export default function TeamCard({
  team,
}: {
  team: RouterOutputs["team"]["ofPlayerOwner"][number];
}) {
  return (
    <Link
      key={team.id}
      href={`/dashboard/${team.id}`}
      className="flex w-full max-w-96 items-center gap-4 rounded-md bg-muted/25 p-4 transition-colors hover:bg-muted/40"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={team.profilePicture ?? undefined}
          alt={`${team.name} - logo`}
          className="rounded-md object-cover"
        />
        <AvatarFallback className="rounded-md bg-muted">
          <UsersIcon className="text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-semibold">{team.name}</span>
        <div className="flex gap-0.5 text-muted-foreground">
          <UserIcon className="h-4 w-4" />
          <span>{team.playerCount}</span>
        </div>
      </div>
    </Link>
  );
}
