import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type StatsCode } from "~/lib/constants";
import { stats } from "~/server/db/schema";

export const statsRouter = createTRPCRouter({
  add: protectedProcedure
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

      await ctx.db.insert(stats).values({
        playerId,
        matchId,
        code,
        set,
      });
    }),
});
