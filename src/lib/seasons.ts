import dayjs from "dayjs";
import { type Season } from "./constants";

export function getCurrentSeason(): Season {
  let startingYear;
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();

  if (currentMonth >= 9) startingYear = currentYear;
  else startingYear = currentYear - 1;

  return `${startingYear}/${startingYear + 1}`;
}

export function generateSeasonList({
  seasons,
}: {
  seasons: Season[] | null | undefined;
}) {
  const currSeason = getCurrentSeason();
  if (!seasons?.[0]) return [currSeason];

  if (!seasons.includes(currSeason)) {
    return [...seasons, currSeason].reverse();
  }

  return seasons.reverse();
}
