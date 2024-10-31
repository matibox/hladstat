import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Share2Icon, UserIcon, UsersIcon } from "lucide-react";

export default function TeamCard({
  team,
}: {
  team: RouterOutputs["team"]["ofUser"][number];
}) {
  console.log(team);

  return (
    <Link
      key={team.id}
      href={`/dashboard/${team.id}`}
      className="relative flex w-full max-w-96 items-center gap-4 rounded-md bg-muted/25 p-4 transition-colors hover:bg-muted/40"
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
        {team.userRole === "shared" && (
          <div
            className="absolute -right-2 -top-2 rounded-full bg-primary p-2"
            title="Drużyna udostępniona"
          >
            <Share2Icon className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}
        <span className="text-lg font-semibold">{team.name}</span>
        <div className="flex gap-0.5 text-muted-foreground">
          <UserIcon className="h-4 w-4" />
          <span>{team.playerCount}</span>
        </div>
      </div>
    </Link>
  );
}
