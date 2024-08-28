import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { api } from "~/trpc/server";

export default async function AllMatchesNav({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const team = await api.team.byId({ teamId });

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink
          href={`/dashboard/${teamId}`}
          className="flex items-center gap-2"
        >
          {team?.profilePicture && (
            <Avatar className="h-6 w-6 rounded-sm">
              <AvatarImage
                src={team.profilePicture}
                alt={`${team.name} - logo`}
              />
            </Avatar>
          )}
          <span>{team?.name}</span>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Wszystkie mecze</BreadcrumbPage>
      </BreadcrumbItem>
    </>
  );
}
