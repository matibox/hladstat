import { createTRPCRouter, protectedProcedure } from "../trpc";
import { teams, users, usersToTeams } from "~/server/db/schema";
import { and, eq, inArray, isNull, like, not, or, sql } from "drizzle-orm";
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
  byQueryNotSharedFromTeam: protectedProcedure
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
  sharedTeams: protectedProcedure.query(async ({ ctx }) => {
    const playerCountSubquery = ctx.db
      .select({
        teamId: usersToTeams.teamId,
        playerCount: sql<number>`COUNT(*)`.as("playerCount"),
      })
      .from(usersToTeams)
      .where(inArray(usersToTeams.role, ["owner", "player"]))
      .groupBy(usersToTeams.teamId)
      .as("playerCountSubquery");

    // Main query to select teams where the user has the "shared" role
    const result = await ctx.db
      .select({
        id: teams.id,
        name: teams.name,
        profilePicture: teams.profilePicture,
        playerCount: playerCountSubquery.playerCount,
      })
      .from(teams)
      .leftJoin(
        usersToTeams,
        and(
          eq(usersToTeams.teamId, teams.id),
          eq(usersToTeams.userId, ctx.session.user.id),
        ),
      )
      .leftJoin(playerCountSubquery, eq(teams.id, playerCountSubquery.teamId))
      .where(eq(usersToTeams.role, "shared"));

    return result;
  }),
});
