import {
  createTRPCRouter,
  protectedProcedure,
  teamOwnerProcedure,
  teamPlayersReaderProcedure,
} from "~/server/api/trpc";
import { getTeamMembership } from "~/server/authz/queries";
import { users, usersToTeams } from "~/server/db/schema";
import {
  and,
  eq,
  ilike,
  isNull,
  like,
  not,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { type Role } from "~/lib/constants";

export const userRouter = createTRPCRouter({
  // CREATE
  // READ
  isInTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const membership = await getTeamMembership(
        ctx.db,
        ctx.session.user.id,
        teamId,
      );

      return {
        isInTeam: !!membership,
        role: membership?.role ?? null,
      };
    }),
  byQueryNotInTeam: teamOwnerProcedure
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
            notExists(
              ctx.db
                .select({ userId: usersToTeams.userId })
                .from(usersToTeams)
                .where(
                  and(
                    eq(usersToTeams.userId, users.id),
                    eq(usersToTeams.teamId, teamId),
                  ),
                ),
            ),
            or(
              ilike(users.firstName, pattern),
              ilike(users.lastName, pattern),
              sql`${users.firstName} || ' ' || ${users.lastName} ILIKE ${pattern}`,
            ),
          ),
        );
    }),
  byQueryNotViewerOfTeam: teamOwnerProcedure
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
  byTeamPlayers: teamPlayersReaderProcedure
    .input(
      z.object({
        teamId: z.number(),
        matchId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return (
        await ctx.db.query.usersToTeams.findMany({
          columns: {
            position: true,
            shirtNumber: true,
            isActive: true,
            role: true,
          },
          where: (table, { eq, and, inArray }) =>
            and(
              eq(table.teamId, teamId),
              inArray(table.role, ["owner", "player"]),
            ),
          with: {
            user: { columns: { id: true, firstName: true, lastName: true } },
          },
          orderBy: sql`${usersToTeams.isActive} desc, ${usersToTeams.shirtNumber} asc`,
        })
      ).map(({ user, ...data }) => ({ ...data, ...user }));
    }),
  byTeamViewers: teamOwnerProcedure
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
  updateIsActive: teamOwnerProcedure
    .input(
      z.object({ userId: z.string(), teamId: z.number(), active: z.boolean() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, teamId, active } = input;

      await ctx.db
        .update(usersToTeams)
        .set({ isActive: active })
        .where(
          and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
        );
    }),
  updateTeamRole: teamOwnerProcedure
    .input(
      z.object({
        userId: z.string(),
        teamId: z.number(),
        role: z.custom<Role>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, teamId, role } = input;

      await ctx.db
        .update(usersToTeams)
        .set({ role })
        .where(
          and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
        );
    }),

  // DELETE
});
