import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { and, eq, like, not, or, sql } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateNameAndSurname: protectedProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName } = input;

      await ctx.db
        .update(users)
        .set({ firstName, lastName })
        .where(eq(users.id, ctx.session.user.id));
    }),
  byQuery: protectedProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;

      const pattern = `%${q}%`;

      return await ctx.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(
          and(
            not(eq(users.id, ctx.session.user.id)),
            or(
              like(users.firstName, pattern),
              like(users.lastName, pattern),
              sql`${users.firstName} || ' ' || ${users.lastName} LIKE ${pattern}`,
            ),
          ),
        );
    }),
});
