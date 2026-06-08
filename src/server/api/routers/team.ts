import { matches, teams, usersToTeams } from "~/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  teamEditorProcedure,
  teamMemberProcedure,
  teamOwnerProcedure,
} from "~/server/api/trpc";
import z from "zod";
import { and, eq, inArray, count, asc, max } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { positions } from "~/lib/constants";

export const teamRouter = createTRPCRouter({
  // CREATE
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        profilePicture: z.string().optional(),
        position: z.enum(positions),
        shirtNumber: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, profilePicture, position, shirtNumber } = input;

      const insertedTeams = await ctx.db
        .insert(teams)
        .values({ name, profilePicture })
        .returning({ teamId: teams.id });

      await ctx.db.insert(usersToTeams).values({
        teamId: insertedTeams[0]!.teamId,
        userId: ctx.session.user.id,
        role: "owner",
        position,
        shirtNumber,
      });
    }),
  addPlayer: teamOwnerProcedure
    .input(
      z.object({
        teamId: z.number(),
        playerId: z.string(),
        position: z.enum(positions),
        shirtNumber: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, playerId, position, shirtNumber } = input;

      await ctx.db.insert(usersToTeams).values({
        teamId,
        userId: playerId,
        position,
        shirtNumber,
        role: "player",
      });
    }),
  shareViewerAccess: teamOwnerProcedure
    .input(z.object({ teamId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, userId } = input;

      await ctx.db.insert(usersToTeams).values({
        teamId,
        userId,
        role: "shared",
      });
    }),
  // READ
  byId: teamMemberProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db.query.teams.findFirst({
        columns: {
          id: true,
          name: true,
          profilePicture: true,
          archived: true,
        },
        where: eq(teams.id, parseInt(teamId)),
        with: {
          users: {
            columns: { role: true },
            with: {
              user: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    }),
  ofUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userTeams = await ctx.db
      .select({
        userRole: usersToTeams.role,
        id: teams.id,
        name: teams.name,
        profilePicture: teams.profilePicture,
        archived: teams.archived,
        archivedAt: teams.archivedAt,
      })
      .from(usersToTeams)
      .innerJoin(teams, eq(usersToTeams.teamId, teams.id))
      .where(eq(usersToTeams.userId, userId));

    return await Promise.all(
      userTeams.map(async (team) => {
        const playerCount = (
          await ctx.db
            .select({ playerCount: count() })
            .from(usersToTeams)
            .where(
              and(
                eq(usersToTeams.teamId, team.id),
                inArray(usersToTeams.role, ["player", "owner"]),
              ),
            )
        )[0]!.playerCount;

        const lastMatchDate =
          (
            await ctx.db
              .select({ lastMatchDate: max(matches.date) })
              .from(matches)
              .where(eq(matches.teamId, team.id))
          )[0]?.lastMatchDate ?? null;

        return {
          ...team,
          playerCount,
          lastMatchDate,
        };
      }),
    );
  }),
  matchSettings: teamEditorProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;
      const settings = await ctx.db
        .select({ allowTwoSetMatches: teams.allowTwoSetMatches })
        .from(teams)
        .where(eq(teams.id, teamId));

      return settings[0]!;
    }),
  seasons: teamMemberProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const seasons = await ctx.db
        .selectDistinct({ season: matches.season })
        .from(matches)
        .innerJoin(teams, eq(teams.id, teamId))
        .orderBy(asc(matches.season));

      if (!seasons) return null;

      return seasons.map((s) => s.season);
    }),
  // UPDATE
  saveMatchSettings: teamOwnerProcedure
    .input(z.object({ teamId: z.number(), allowTwoSetMatches: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, ...settings } = input;

      await ctx.db
        .update(teams)
        .set({ ...settings })
        .where(eq(teams.id, teamId));
    }),
  archive: teamOwnerProcedure
    .input(z.object({ teamId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;

      await ctx.db
        .update(teams)
        .set({ archived: true, archivedAt: new Date() })
        .where(eq(teams.id, teamId));
    }),
  unarchive: teamOwnerProcedure
    .input(z.object({ teamId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;

      await ctx.db
        .update(teams)
        .set({ archived: false, archivedAt: null })
        .where(eq(teams.id, teamId));
    }),
  // DELETE
  revokeViewerAccess: teamOwnerProcedure
    .input(z.object({ userId: z.string(), teamId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, teamId } = input;

      await ctx.db
        .delete(usersToTeams)
        .where(
          and(
            eq(usersToTeams.userId, userId),
            eq(usersToTeams.teamId, teamId),
            eq(usersToTeams.role, "shared"),
          ),
        );
    }),
  delete: teamOwnerProcedure
    .input(z.object({ teamId: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, name } = input;

      const team = await ctx.db.query.teams.findFirst({
        columns: { id: true, name: true },
        where: eq(teams.id, teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nie znaleziono drużyny.",
        });
      }

      if (team.name !== name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Podana nazwa nie zgadza się z nazwą drużyny.",
        });
      }

      await ctx.db.delete(matches).where(eq(matches.teamId, teamId));
      await ctx.db.delete(usersToTeams).where(eq(usersToTeams.teamId, teamId));
      await ctx.db.delete(teams).where(eq(teams.id, teamId));
    }),
});
