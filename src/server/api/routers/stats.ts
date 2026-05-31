import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  matchOwnerProcedure,
  matchStatEditorProcedure,
  matchStatsReaderProcedure,
  teamMemberProcedure,
} from "~/server/api/trpc";
import { type Season, type StatsCode } from "~/lib/constants";
import { matches, stats, users, usersToTeams } from "~/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const statsRouter = createTRPCRouter({
  // CREATE
  addByMatchPlayer: matchStatEditorProcedure
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
  byMatch: matchStatsReaderProcedure
    .input(z.object({ teamId: z.number(), matchId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;
      const matchId = ctx.match.id;

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
  byMatchPlayer: matchStatsReaderProcedure
    .input(
      z.object({
        matchId: z.number(),
        teamId: z.number(),
        playerId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { playerId, teamId } = input;
      const matchId = ctx.match.id;

      const selectedStats = await ctx.db.query.stats.findMany({
        where: (stats, { eq, and }) =>
          and(eq(stats.playerId, playerId), eq(stats.matchId, matchId)),
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
  byTeamAndSeason: teamMemberProcedure
    .input(z.object({ teamId: z.number(), season: z.custom<Season>() }))
    .query(async ({ ctx, input }) => {
      const { teamId, season } = input;

      const foundMatches = await ctx.db.query.matches.findMany({
        columns: { id: true },
        where: (matches, { and, eq }) =>
          and(eq(matches.teamId, teamId), eq(matches.season, season)),
        with: {
          stats: {
            columns: { id: true, code: true, set: true },
            with: {
              player: {
                columns: { firstName: true, lastName: true },
                with: {
                  teams: {
                    columns: { position: true },
                    where: (teams, { eq }) => eq(teams.teamId, teamId),
                  },
                },
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
  byTeamPlayer: teamMemberProcedure
    .input(
      z.object({
        playerId: z.string(),
        teamId: z.number(),
        season: z.custom<Season>(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { playerId, teamId, season } = input;

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
        .where(
          and(
            eq(stats.playerId, playerId),
            eq(matches.teamId, teamId),
            eq(matches.season, season),
          ),
        );

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
  delete: matchStatEditorProcedure
    .input(z.object({ statId: z.string(), matchId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { statId } = input;

      const deletedRecords = await ctx.db
        .delete(stats)
        .where(and(eq(stats.id, statId), eq(stats.matchId, ctx.match.id)))
        .returning({ code: stats.code });

      if (!deletedRecords[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nie znaleziono statystyki.",
        });
      }

      return deletedRecords[0];
    }),
  deleteByMatchIdAndSet: matchOwnerProcedure
    .input(z.object({ matchId: z.number(), sets: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const { matchId, sets } = input;

      await ctx.db
        .delete(stats)
        .where(and(eq(stats.matchId, matchId), inArray(stats.set, sets)));

      return { sets };
    }),
});
