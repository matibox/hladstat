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
});
