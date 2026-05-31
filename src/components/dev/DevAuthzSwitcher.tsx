"use client";

import { FlaskConicalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { devAuthzRoles } from "~/dev/authz-override";
import { cn } from "~/lib/utils";

import { useDevAuthz } from "./DevAuthzProvider";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const roleLabels: Record<(typeof devAuthzRoles)[number] | "off", string> = {
  off: "Off",
  owner: "Owner",
  player: "Player",
  shared: "Shared",
  public: "Public",
};

export default function DevAuthzSwitcher() {
  const devAuthz = useDevAuthz();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [expanded]);

  if (!devAuthz) return null;

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto fixed bottom-4 left-4 z-[9999]"
    >
      {expanded ? (
        <div className="w-60 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide">
                Dev authz
              </span>
              {devAuthz.isActive && (
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  DEV
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => setExpanded(false)}
            >
              Close
            </Button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-1">
            {(["off", ...devAuthzRoles] as const).map((role) => (
              <Button
                key={role}
                size="sm"
                variant={devAuthz.role === role ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => devAuthz.setRole(role)}
              >
                {roleLabels[role]}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="dev-authz-archived" className="text-xs">
                Archived team
              </Label>
              <Switch
                id="dev-authz-archived"
                checked={devAuthz.simulateArchived}
                onCheckedChange={devAuthz.setSimulateArchived}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="dev-authz-locked" className="text-xs">
                Locked match
              </Label>
              <Switch
                id="dev-authz-locked"
                checked={devAuthz.simulateLocked}
                onCheckedChange={devAuthz.setSimulateLocked}
              />
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="icon"
          variant="outline"
          aria-label="Dev authz"
          className={cn(
            "h-10 w-10 opacity-50 shadow-sm backdrop-blur",
            devAuthz.isActive && "border-amber-500 opacity-100",
          )}
          onClick={() => setExpanded(true)}
        >
          <FlaskConicalIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
