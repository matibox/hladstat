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
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamPageNavbar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOwner, tabs } = useTeamContext();
  const router = useRouter();

  const currentTab = searchParams.get("t") ?? tabs[0];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    trackTouch: true,
    trackMouse: false,
  });

  function handleSwipe(direction: "left" | "right") {
    const currIdx = tabs.indexOf(currentTab);
    let newIdx;

    if (direction === "left") {
      newIdx = currIdx < tabs.length - 1 ? currIdx + 1 : currIdx;
    } else {
      newIdx = currIdx > 0 ? currIdx - 1 : currIdx;
    }

    const nextTab = tabs[newIdx];
    if (!nextTab) return;

    router.push(`${pathname}?t=${nextTab}`);
  }

  useEffect(() => {
    tabs.forEach((tab) => {
      router.prefetch(`${pathname}?t=${tab}`);
    });
  }, [router, pathname, tabs]);

  return (
    <Tabs value={currentTab} className="flex flex-col md:gap-2">
      <div {...swipeHandlers}>{children}</div>
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 md:static md:-order-1 md:mx-auto md:w-full md:max-w-7xl md:border-none md:px-6 lg:px-8">
        <TabsList
          className="grid h-auto w-full bg-background md:flex md:w-min md:justify-start md:bg-muted/25"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          }}
        >
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
          {isOwner && (
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
