import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type StatsCode } from "~/lib/constants";
import { matches, stats, users, usersToTeams } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export const statsRouter = createTRPCRouter({
  // CREATE
  addByMatchPlayer: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        matchId: z.number(),
        set: z.number(),
        code: z.custom<StatsCode>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playerId, matchId, set, code } = input;

      const insertedValues = await ctx.db
        .insert(stats)
        .values({
          playerId,
          matchId,
          code,
          set,
        })
        .returning({
          id: stats.id,
          code: stats.code,
        });

      return insertedValues[0]!;
    }),
  // READ
  byMatch: publicProcedure
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
  byMatchPlayer: publicProcedure
    .input(
      z.object({
        matchId: z.number(),
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
  byTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const foundMatches = await ctx.db.query.matches.findMany({
        columns: { id: true },
        where: (matches, { eq }) => eq(matches.teamId, teamId),
        with: {
          stats: {
            columns: { id: true, code: true, set: true },
            with: {
              player: {
                columns: { firstName: true, lastName: true },
                with: { teams: { columns: { position: true } } },
              },
            },
          },
        },
      });

      return foundMatches
        .flatMap((match) => match.stats)
        .map(({ player, ...stat }) => ({
          ...stat,
          player: {
            name: `${player.firstName} ${player.lastName}`,
            position: player.teams[0]!.position!,
          },
        }));
    }),
  byTeamPlayer: protectedProcedure
    .input(z.object({ playerId: z.string(), teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { playerId, teamId } = input;

      const selectedStats = await ctx.db
        .select({
          id: stats.id,
          code: stats.code,
          set: stats.set,
          player: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            position: usersToTeams.position,
          },
        })
        .from(stats)
        .innerJoin(matches, eq(stats.matchId, matches.id))
        .innerJoin(users, eq(stats.playerId, users.id))
        .innerJoin(
          usersToTeams,
          and(
            eq(usersToTeams.userId, users.id),
            eq(usersToTeams.teamId, matches.teamId),
          ),
        )
        .where(and(eq(stats.playerId, playerId), eq(matches.teamId, teamId)));

      const formatted = selectedStats.map(({ player, ...stat }) => ({
        ...stat,
        player: {
          name: `${player.firstName} ${player.lastName}`,
          position: player.position!,
        },
      }));

      return formatted;
    }),
  // UPDATE
  // DELETE
  delete: protectedProcedure
    .input(z.object({ statId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { statId } = input;

      const deletedRecords = await ctx.db
        .delete(stats)
        .where(eq(stats.id, statId))
        .returning({ code: stats.code });

      return deletedRecords[0]!;
    }),
});
