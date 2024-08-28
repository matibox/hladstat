import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, usersToTeams } from "~/server/db/schema";
import { and, eq, isNull, like, not, or, sql } from "drizzle-orm";
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
  byQueryNotInTeam: protectedProcedure
    .input(z.object({ q: z.string(), teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { q, teamId } = input;

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
              isNull(usersToTeams.teamId),
              not(eq(usersToTeams.teamId, teamId)),
            ),
            or(
              like(users.firstName, pattern),
              like(users.lastName, pattern),
              sql`${users.firstName} || ' ' || ${users.lastName} LIKE ${pattern}`,
            ),
          ),
        )
        .leftJoin(usersToTeams, eq(users.id, usersToTeams.userId));
    }),
  isInTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const foundTeam = await ctx.db.query.usersToTeams.findFirst({
        columns: { teamId: true },
        where: (usersToTeams, { eq }) => eq(usersToTeams.teamId, teamId),
      });

      return { isInTeam: !!foundTeam };
    }),
});
