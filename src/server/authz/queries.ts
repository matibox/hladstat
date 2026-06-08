import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

import type { Role } from "~/lib/constants";
import type { db } from "~/server/db";
import { matches, usersToTeams } from "~/server/db/schema";

type Db = typeof db;

export type TeamMembership = {
  role: Role;
  teamArchived: boolean;
};

export async function getTeamMembership(
  db: Db,
  userId: string,
  teamId: number,
): Promise<TeamMembership | null> {
  const membership = await db.query.usersToTeams.findFirst({
    columns: { role: true },
    where: (usersToTeams, { and, eq }) =>
      and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
    with: {
      team: { columns: { archived: true } },
    },
  });

  if (!membership) return null;

  return {
    role: membership.role,
    teamArchived: membership.team.archived ?? false,
  };
}

export async function getMatchById(db: Db, matchId: number) {
  return await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });
}

export function assertMatchBelongsToTeam(
  match: typeof matches.$inferSelect,
  teamId: number,
): void {
  if (match.teamId !== teamId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Mecz nie należy do tej drużyny.",
    });
  }
}

export async function assertPlayerOnTeamRoster(
  db: Db,
  playerId: string,
  teamId: number,
): Promise<void> {
  const rosterMember = await db.query.usersToTeams.findFirst({
    columns: { userId: true },
    where: and(
      eq(usersToTeams.userId, playerId),
      eq(usersToTeams.teamId, teamId),
      inArray(usersToTeams.role, ["owner", "player"]),
    ),
  });

  if (!rosterMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Zawodnik nie należy do tej drużyny.",
    });
  }
}
