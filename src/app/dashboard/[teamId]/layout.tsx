import React from "react";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { api } from "~/trpc/server";

export default async function TeamLayout({
  params: { teamId },
  children,
}: {
  children: React.ReactNode;
  params: { teamId: string };
}) {
  const team = await api.team.byId({ teamId });

  return (
    <>
      <nav className="flex flex-col p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Drużyny</BreadcrumbLink>
            </BreadcrumbItem>
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
          </BreadcrumbList>
        </Breadcrumb>
        <div>tab1</div>
      </nav>
      {children}
    </>
  );
}
