export const roles = ["owner", "player"] as const;

export const positions = [
  "Przyjmujący",
  "Rozgrywający",
  "Atakujący",
  "Środkowy",
  "Libero",
  "Nieokreślona",
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
