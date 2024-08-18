export const roles = ["owner", "player"] as const;

export const positions = [
  "Przyjmujący",
  "Rozgrywający",
  "Atakujący",
  "Środkowy",
  "Libero",
] as const;

export const PLACEHOLDER_MATCHES = [
  {
    vs: "Humansport Kumple",
    score: "3:0",
    teamStats: {
      attackPerc: 47,
      posReceptionPerc: 56,
      blocks: 3,
      aces: 2,
    },
    date: new Date(),
  },
  {
    vs: "RMJ Księżyc",
    score: "3:2",
    teamStats: {
      attackPerc: 32,
      posReceptionPerc: 54,
      blocks: 2,
      aces: 0,
    },
    date: new Date(),
  },
].map((match, i) => ({ id: i, ...match }));

export const PLACEHOLDER_PLAYERS = [
  {
    firstName: "Mateusz",
    lastName: "Hladky",
    position: "Przyjmujący",
    shirtNumber: 12,
    stats: {
      attackPerc: 45,
      posReceptionPerc: 54,
      blocks: 7,
      aces: 1,
      points: 27,
      matches: 2,
    },
  },
  {
    firstName: "Szymon",
    lastName: "Wlach",
    position: "Środkowy",
    shirtNumber: 10,
    stats: {
      attackPerc: 67,
      posReceptionPerc: 0,
      blocks: 13,
      aces: 1,
      points: 15,
      matches: 2,
    },
  },
].map((player, i) => ({ id: i, ...player }));
