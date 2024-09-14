import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { matches } from "~/server/db/schema";

export const matchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        date: z.date(),
        opponent: z.string(),
        score: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { date, opponent, score, teamId } = input;

      const [data] = await ctx.db
        .insert(matches)
        .values({
          teamId,
          date,
          opponent,
          score,
        })
        .returning({ matchId: matches.id });

      return { matchId: data?.matchId };
    }),
  byId: protectedProcedure
    .input(z.object({ matchId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { matchId } = input;

      const selectedMatch = await ctx.db.query.matches.findFirst({
        where: (matches, { eq }) => eq(matches.id, matchId),
      });

      return {
        ...selectedMatch,
        numberOfSets:
          selectedMatch?.score
            .split(":")
            .map(Number)
            .reduce((a, b) => a + b, 0) ?? 0,
      };
    }),
  stats: protectedProcedure
    .input(z.object({ teamId: z.number(), matchId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId, matchId } = input;

      const selectedMatch = await ctx.db.query.matches.findFirst({
        where: (matches, { eq }) => eq(matches.id, matchId),
        columns: { id: true },
        with: {
          stats: {
            columns: { id: true, set: true, code: true },
            with: {
              player: {
                columns: { id: true, firstName: true, lastName: true },
                with: {
                  teams: {
                    where: (usersToTeams, { eq, and, inArray }) =>
                      and(
                        eq(usersToTeams.teamId, teamId),
                        inArray(usersToTeams.role, ["owner", "player"]),
                      ),
                    columns: { position: true },
                  },
                },
              },
            },
          },
        },
      });

      const stats = selectedMatch?.stats.map(({ player, ...stat }) => {
        return {
          ...stat,
          player: {
            name: `${player.firstName} ${player.lastName}`,
            position: player.teams[0]!.position!,
          },
        };
      });

      return stats!;
    }),
  playerStats: protectedProcedure
    .input(
      z.object({
        matchId: z.number().optional(),
        teamId: z.number(),
        playerId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { matchId, playerId, teamId } = input;

      const selectedStats = await ctx.db.query.stats.findMany({
        where: (stats, { eq, and }) =>
          matchId
            ? and(eq(stats.playerId, playerId), eq(stats.matchId, matchId))
            : eq(stats.playerId, playerId),
        columns: { id: true, code: true, set: true },
        with: {
          player: {
            columns: { id: true, firstName: true, lastName: true },
            with: {
              teams: {
                where: (usersToTeams, { eq, and, inArray }) =>
                  and(
                    eq(usersToTeams.teamId, teamId),
                    inArray(usersToTeams.role, ["owner", "player"]),
                  ),
                columns: { position: true },
              },
            },
          },
        },
      });

      const stats = selectedStats.map(({ player, ...stat }) => {
        return {
          ...stat,
          player: {
            name: `${player.firstName} ${player.lastName}`,
            position: player.teams[0]!.position!,
          },
        };
      });

      return stats;
    }),
});
