import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { api } from "~/trpc/server";

export default async function TeamNav({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const team = await api.team.byId({ teamId });

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="flex items-center gap-2">
          {team?.profilePicture && (
            <Avatar className="h-6 w-6 rounded-sm">
              <AvatarImage
                src={team.profilePicture}
                alt={`${team.name} - logo`}
              />
            </Avatar>
          )}
          <span>{team?.name}</span>
        </BreadcrumbPage>
      </BreadcrumbItem>
    </>
  );
}
