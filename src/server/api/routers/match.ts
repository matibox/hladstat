import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { formSchema as newMatchSchema } from "~/components/NewMatchForm";
import { matches } from "~/server/db/schema";

export const matchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ teamId: z.number() }).and(newMatchSchema))
    .mutation(async ({ ctx, input }) => {
      const { date, opponent, score, teamId } = input;

      await ctx.db.insert(matches).values({
        teamId,
        date,
        opponent,
        score,
      });
    }),
});
