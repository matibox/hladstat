import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type StatsCode } from "~/lib/constants";
import { stats } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const statsRouter = createTRPCRouter({
  addToPlayer: protectedProcedure
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
