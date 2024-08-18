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
});
