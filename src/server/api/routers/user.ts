import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, usersToTeams } from "~/server/db/schema";
import { and, eq, inArray, isNull, like, not, or, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // CREATE
  // READ
  isInTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const foundTeam = await ctx.db.query.usersToTeams.findFirst({
        columns: { teamId: true },
        where: (usersToTeams, { and, eq }) =>
          and(
            eq(usersToTeams.teamId, teamId),
            eq(usersToTeams.userId, ctx.session.user.id),
          ),
      });

      return { isInTeam: !!foundTeam };
    }),
  isPlayerOrOwnerOfTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const foundTeam = await ctx.db
        .select({ teamId: usersToTeams.teamId })
        .from(usersToTeams)
        .where(
          and(
            eq(usersToTeams.teamId, teamId),
            eq(usersToTeams.userId, ctx.session.user.id),
            inArray(usersToTeams.role, ["owner", "player"]),
          ),
        );

      const isPlayerOrOwner = !!foundTeam[0];

      return { isPlayerOrOwner };
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
  byQueryNotViewerOfTeam: protectedProcedure
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
        .leftJoin(
          usersToTeams,
          and(
            eq(users.id, usersToTeams.userId),
            eq(usersToTeams.teamId, teamId),
          ),
        )
        .where(
          and(
            isNull(usersToTeams.teamId),
            or(
              like(users.firstName, pattern),
              like(users.lastName, pattern),
              sql`${users.firstName} || ' ' || ${users.lastName} LIKE ${pattern}`,
            ),
          ),
        );
    }),
  byTeamPlayers: publicProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return (
        await ctx.db.query.usersToTeams.findMany({
          columns: { position: true, shirtNumber: true },
          where: (table, { eq, and, inArray }) =>
            and(
              eq(table.teamId, teamId),
              inArray(table.role, ["owner", "player"]),
            ),
          with: {
            user: { columns: { id: true, firstName: true, lastName: true } },
          },
          orderBy: (table, { asc }) => asc(table.shirtNumber),
        })
      )
        .map(({ user, ...data }) => ({ ...data, ...user }))
        .sort((_, b) => {
          if (!b.shirtNumber) return -1;
          return 0;
        });
    }),
  byTeamViewers: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .leftJoin(
          usersToTeams,
          and(
            eq(users.id, usersToTeams.userId),
            eq(usersToTeams.teamId, teamId),
          ),
        )
        .where(eq(usersToTeams.role, "shared"));
    }),

  // UPDATE
  updateFullName: protectedProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName } = input;

      await ctx.db
        .update(users)
        .set({ firstName, lastName })
        .where(eq(users.id, ctx.session.user.id));
    }),

  // DELETE
});
