"use client";

import { api } from "~/trpc/react";
import { useTeamContext } from "./TeamContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { generateSeasonList } from "~/lib/seasons";

export function SeasonSelect() {
  const { currentSeason, setCurrentSeason, teamId } = useTeamContext();

  const { data: seasons } = api.team.seasons.useQuery({ teamId });

  const list = generateSeasonList({ seasons });

  return (
    <Select value={currentSeason} onValueChange={setCurrentSeason}>
      <div className="flex flex-col gap-1">
        <p className="hidden text-lg font-medium sm:inline-block">Sezon</p>
        <SelectTrigger className="sm:max-w-xs">
          <SelectValue placeholder="Wybierz sezon" />
        </SelectTrigger>
      </div>
      <SelectContent>
        <SelectGroup>
          {list.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
