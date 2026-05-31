import { z } from "zod";
import {
  createTRPCRouter,
  matchOwnerProcedure,
  matchReaderProcedure,
  teamEditorProcedure,
  teamMemberProcedure,
} from "~/server/api/trpc";
import { matches } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { type Season } from "~/lib/constants";

export const matchRouter = createTRPCRouter({
  // CREATE
  create: teamEditorProcedure
    .input(
      z.object({
        teamId: z.number(),
        date: z.date(),
        opponent: z.string(),
        score: z.string(),
        season: z.custom<Season>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { date, opponent, score, teamId, season } = input;

      const [data] = await ctx.db
        .insert(matches)
        .values({
          teamId,
          date,
          opponent,
          score,
          season,
        })
        .returning({ matchId: matches.id });

      return { matchId: data?.matchId };
    }),
  // READ
  byId: matchReaderProcedure
    .input(z.object({ matchId: z.number() }))
    .query(async ({ ctx }) => {
      const selectedMatch = ctx.match;

      return {
        ...selectedMatch,
        numberOfSets:
          selectedMatch.score
            .split(":")
            .map(Number)
            .reduce((a, b) => a + b, 0) ?? 0,
      };
    }),
  byTeamRecent: teamMemberProcedure
    .input(z.object({ teamId: z.number(), season: z.custom<Season>() }))
    .query(async ({ ctx, input }) => {
      const { teamId, season } = input;

      return await ctx.db.query.matches.findMany({
        columns: {
          id: true,
          date: true,
          opponent: true,
          score: true,
          season: true,
        },
        where: (matches, { and, eq }) =>
          and(eq(matches.teamId, teamId), eq(matches.season, season)),
        orderBy: (matches, { desc }) => desc(matches.date),
        limit: 6,
      });
    }),
  byTeamWithStats: teamMemberProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db.query.matches.findMany({
        columns: {
          id: true,
          date: true,
          opponent: true,
          score: true,
          season: true,
        },
        where: (matches, { eq }) => eq(matches.teamId, teamId),
        orderBy: (matches, { desc }) => desc(matches.date),
        with: { stats: { columns: { id: true, code: true } } },
      });
    }),
  // UPDATE
  toggleShare: matchOwnerProcedure
    .input(z.object({ matchId: z.number(), isShared: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { matchId, isShared } = input;

      await ctx.db
        .update(matches)
        .set({ shared: !isShared })
        .where(eq(matches.id, matchId));
    }),
  toggleAnalysisLock: matchOwnerProcedure
    .input(z.object({ matchId: z.number(), isLocked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { matchId, isLocked } = input;

      await ctx.db
        .update(matches)
        .set({ lockedAnalysis: !isLocked })
        .where(eq(matches.id, matchId));
    }),
  // DELETE
});
