import { matches, teams, users, usersToTeams } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import z from "zod";
import { and, eq, inArray, sql, count, asc } from "drizzle-orm";
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
  addPlayer: protectedProcedure
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
  shareViewerAccess: protectedProcedure
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
  byId: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db.query.teams.findFirst({
        columns: { id: true, name: true, profilePicture: true },
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
    const selectedUsersToTeams = await ctx.db.query.usersToTeams.findMany({
      columns: { teamId: true, role: true },
      where: (usersToTeams, { eq }) => eq(usersToTeams.userId, userId),
      with: {
        team: { columns: { id: true, name: true, profilePicture: true } },
      },
    });

    return await Promise.all(
      selectedUsersToTeams.map(async ({ role, team }) => {
        const [selectedTeam] = await ctx.db
          .select({ playerCount: count() })
          .from(users)
          .leftJoin(usersToTeams, eq(users.id, usersToTeams.userId))
          .where(
            and(
              eq(usersToTeams.teamId, team.id),
              inArray(usersToTeams.role, ["player", "owner"]),
            ),
          );

        if (!selectedTeam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Nie znaleziono drużyny.",
          });
        }

        return {
          ...team,
          userRole: role,
          playerCount: selectedTeam.playerCount,
        };
      }),
    );
  }),
  ofViewer: protectedProcedure.query(async ({ ctx }) => {
    const playerCountSubquery = ctx.db
      .select({
        teamId: usersToTeams.teamId,
        playerCount: sql<number>`COUNT(*)`.as("playerCount"),
      })
      .from(usersToTeams)
      .where(inArray(usersToTeams.role, ["owner", "player"]))
      .groupBy(usersToTeams.teamId)
      .as("playerCountSubquery");

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
  matchSettings: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;
      const settings = await ctx.db
        .select({ allowTwoSetMatches: teams.allowTwoSetMatches })
        .from(teams)
        .where(eq(teams.id, teamId));

      return settings[0]!;
    }),
  seasons: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const seasons = await ctx.db
        .selectDistinct({ season: matches.season })
        .from(matches)
        .leftJoin(teams, eq(teams.id, teamId))
        .orderBy(asc(matches.season));

      if (!seasons) return null;

      return seasons.map((s) => s.season);
    }),
  // UPDATE
  saveMatchSettings: protectedProcedure
    .input(z.object({ teamId: z.number(), allowTwoSetMatches: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, ...settings } = input;

      await ctx.db
        .update(teams)
        .set({ ...settings })
        .where(eq(teams.id, teamId));
    }),
  // DELETE
  revokeViewerAccess: protectedProcedure
    .input(z.object({ userId: z.string(), teamId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, teamId } = input;

      await ctx.db
        .delete(usersToTeams)
        .where(
          and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
        );
    }),
});
