"use client";

import React, { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  ClipboardListIcon,
  Loader2Icon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react";
import {
  AttackChart,
  PointsAndErrorsChart,
  ReceptionChart,
  ServeChart,
} from "./StatsCharts";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { countStat } from "~/lib/stats";
import { type SetID } from "./MatchAnalysis";
import { useTeamContext } from "./TeamContext";

export default function PlayerStatsDialog({
  matchId,
  set,
  player: {
    id: playerId,
    firstName,
    lastName,
    position,
    shirtNumber,
    isActive,
  },
}: {
  matchId?: number;
  set: SetID;
  player: RouterOutputs["user"]["byTeamPlayers"][number];
}) {
  const { teamId, isPlayerOrOwner } = useTeamContext();
  const [formOpened, setFormOpened] = useState(false);

  const { data: stats, isPending } = matchId
    ? api.stats.byMatchPlayer.useQuery(
        { matchId, playerId, teamId },
        { enabled: formOpened && !!matchId },
      )
    : api.stats.byTeamPlayer.useQuery(
        { playerId, teamId },
        { enabled: formOpened && !matchId },
      );

  const statsBySet = stats?.filter((stat) => {
    if (set === "Ogółem") return true;
    return stat.set === parseInt(set);
  });

  const utils = api.useUtils();
  const updateIsActive = api.user.updateIsActive.useMutation({
    onSuccess: async () => {
      await utils.user.byTeamPlayers.invalidate();
      setFormOpened(false);
    },
  });

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button
          size="icon"
          variant="secondary"
          className="ml-auto"
          aria-label="Statystyki gracza"
        >
          <ClipboardListIcon className="h-5 w-5" />
        </Button>
      }
      tooltip="Statystyki gracza"
      title={`Statystyki gracza - ${set} ${set !== "Ogółem" ? "set" : ""}`}
      description={`${firstName} ${lastName}, ${position}${shirtNumber ? `, nr ${shirtNumber}` : ""}`}
      className="sm:max-w-[700px] lg:max-w-[1000px]"
    >
      <ScrollArea className="h-[75dvh]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {isPending && (
              <Loader2Icon className="mx-auto animate-spin md:col-span-2 lg:col-span-3" />
            )}
            {statsBySet && (
              <>
                <AttackChart stats={statsBySet} />
                <ReceptionChart stats={statsBySet} />
                <ServeChart stats={statsBySet} />
                <PointsAndErrorsChart
                  stats={statsBySet}
                  defaultMode="details"
                />
                <Card className="border-none bg-muted/25">
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl leading-none">
                      Inne statystyki
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2">
                      <div className="flex flex-col text-muted-foreground">
                        <span>Bloki</span>
                        <span>Obrony</span>
                      </div>
                      <div className="flex flex-col">
                        <span>{countStat(statsBySet, ["other-blk"])}</span>
                        <span>{countStat(statsBySet, ["other-dig"])}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          {isPlayerOrOwner && !matchId && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-semibold leading-none">
                  Ustawienia
                </h2>
                <p className="text-sm text-muted-foreground">
                  Zarządzaj zawodnikiem w drużynie.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="md:self-start"
                  variant={isActive ? "secondary" : "default"}
                  loading={updateIsActive.isPending}
                  onClick={() =>
                    updateIsActive.mutate({
                      userId: playerId,
                      teamId,
                      active: !isActive,
                    })
                  }
                >
                  {isActive ? "Dezaktywuj" : "Aktywuj"}
                  {isActive ? (
                    <UserMinusIcon className="ml-1 h-4 w-4" />
                  ) : (
                    <UserPlusIcon className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </ResponsiveDialog>
  );
}
