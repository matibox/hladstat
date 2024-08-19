"use client";

import React, { useState } from "react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { type RouterOutputs } from "~/trpc/react";
import { ClipboardPlusIcon } from "lucide-react";

export default function AddStatisticForm({
  teamId,
  matchId,
  player: { firstName, lastName, position, shirtNumber },
}: {
  teamId: number;
  matchId: number;
  player: RouterOutputs["team"]["players"][number];
}) {
  const [formOpened, setFormOpened] = useState(false);

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button size="icon" aria-label="Dodaj statystykę">
          <ClipboardPlusIcon className="h-5 w-5" />
        </Button>
      }
      title="Dodaj statystykę"
      description={`${firstName} ${lastName}, ${position}${shirtNumber ? `, nr ${shirtNumber}` : ""}`}
    >
      <div
        onClick={(e) => {
          const target = e.target as HTMLButtonElement;

          console.log(target.value);
        }}
      >
        <Button value="kill">atk kill</Button>
        <Button value="blk">atk blk</Button>
      </div>
    </ResponsiveDialog>
  );
}
