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

  const { data: firstSeason } = api.team.firstSeason.useQuery({ teamId });

  const list = firstSeason
    ? generateSeasonList({ firstSeason })
    : [currentSeason];

  return (
    <Select value={currentSeason} onValueChange={setCurrentSeason}>
      <SelectTrigger>
        <SelectValue placeholder="Wybierz sezon" />
      </SelectTrigger>
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
