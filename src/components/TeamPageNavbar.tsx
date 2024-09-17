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
    <Tabs value={searchParams.get("t") ?? "matches"}>
      {children}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 md:hidden">
        <TabsList className="flex h-auto w-full justify-evenly bg-background">
          <TabsTrigger value="matches" asChild>
            <Link
              href={`${pathname}?t=matches`}
              className="flex flex-col gap-1"
              shallow
            >
              <SwordsIcon className="h-5 w-5" />
              <span className="text-sm leading-none">Mecze</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link
              href={`${pathname}?t=members`}
              className="flex flex-col gap-1"
              shallow
            >
              <UsersIcon className="h-5 w-5" />
              <span className="text-sm leading-none">Członkowie</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="stats" asChild>
            <Link
              href={`${pathname}?t=stats`}
              className="flex flex-col gap-1"
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
                className="flex flex-col gap-1"
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
