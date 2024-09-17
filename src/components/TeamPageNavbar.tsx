"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChartIcon,
  SettingsIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTeamContext } from "./TeamContext";

export default function TeamPageNavbar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPlayerOrOwner } = useTeamContext();

  return (
    <Tabs
      value={searchParams.get("t") ?? "matches"}
      className="flex flex-col md:gap-2"
    >
      {children}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 md:static md:-order-1 md:mx-auto md:w-full md:max-w-7xl md:border-none md:px-6 lg:px-8">
        <TabsList className="flex h-auto w-full justify-evenly bg-background md:w-min md:justify-start md:bg-muted/25">
          <TabsTrigger value="matches" asChild>
            <Link
              href={`${pathname}?t=matches`}
              className="flex flex-col gap-1 md:flex-row md:gap-1.5 md:data-[state=active]:bg-secondary md:data-[state=active]:shadow-none"
              shallow
            >
              <SwordsIcon className="h-5 w-5" />
              <span className="text-sm leading-none">Mecze</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link
              href={`${pathname}?t=members`}
              className="flex flex-col gap-1 md:flex-row md:gap-1.5 md:data-[state=active]:bg-secondary md:data-[state=active]:shadow-none"
              shallow
            >
              <UsersIcon className="h-5 w-5" />
              <span className="text-sm leading-none">Członkowie</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="stats" asChild>
            <Link
              href={`${pathname}?t=stats`}
              className="flex flex-col gap-1 md:flex-row md:gap-1.5 md:data-[state=active]:bg-secondary md:data-[state=active]:shadow-none"
              shallow
            >
              <BarChartIcon className="h-5 w-5" />
              <span className="text-sm leading-none">Statystyki</span>
            </Link>
          </TabsTrigger>
          {isPlayerOrOwner && (
            <TabsTrigger value="settings" asChild>
              <Link
                href={`${pathname}?t=settings`}
                className="flex flex-col gap-1 md:flex-row md:gap-1.5 md:data-[state=active]:bg-secondary md:data-[state=active]:shadow-none"
                shallow
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="text-sm leading-none">Ustawienia</span>
              </Link>
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </Tabs>
  );
}
