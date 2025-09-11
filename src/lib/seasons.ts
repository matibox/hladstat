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

export function generateSeasonList({ firstSeason }: { firstSeason: Season }) {
  const currSeason = getCurrentSeason();
  const [currSeasonStart] = currSeason.split("/").map(Number);
  const [firstSeasonStart] = firstSeason.split("/").map(Number);

  const seasons: Season[] = [];

  for (let i = firstSeasonStart!; i <= currSeasonStart!; i++) {
    seasons.push(`${i}/${i + 1}`);
  }

  return seasons.reverse();
}
