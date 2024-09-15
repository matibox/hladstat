import { matches, stats, teams, users, usersToTeams } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { and, count, eq } from "drizzle-orm";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        profilePicture: z.string().optional(),
        position: z.string(),
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
  listMemberOf: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const selectedUsersToTeams = await ctx.db.query.usersToTeams.findMany({
      columns: { teamId: true },
      where: (usersToTeams, { eq, and, inArray }) =>
        and(
          eq(usersToTeams.userId, userId),
          inArray(usersToTeams.role, ["owner", "player"]),
        ),
      with: {
        team: { columns: { id: true, name: true, profilePicture: true } },
      },
    });

    return await Promise.all(
      selectedUsersToTeams.map(async ({ team }) => {
        const [selectedTeam] = await ctx.db
          .select({ playerCount: count() })
          .from(users)
          .where(eq(usersToTeams.teamId, team.id))
          .leftJoin(usersToTeams, eq(users.id, usersToTeams.userId));

        return {
          ...team,
          playerCount: selectedTeam ? selectedTeam.playerCount : 0,
        };
      }),
    );
  }),
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
  addPlayer: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        playerId: z.string(),
        position: z.string(),
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
  players: protectedProcedure
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
  recentMatches: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db.query.matches.findMany({
        columns: { id: true, date: true, opponent: true, score: true },
        where: (matches, { eq }) => eq(matches.teamId, teamId),
        orderBy: (matches, { desc }) => desc(matches.date),
        limit: 6,
      });
    }),
  stats: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      const foundMatches = await ctx.db.query.matches.findMany({
        columns: { id: true },
        where: (matches, { eq }) => eq(matches.teamId, teamId),
        with: {
          stats: {
            columns: { id: true, code: true, set: true },
            with: {
              player: {
                columns: { firstName: true, lastName: true },
                with: { teams: { columns: { position: true } } },
              },
            },
          },
        },
      });

      return foundMatches
        .flatMap((match) => match.stats)
        .map(({ player, ...stat }) => ({
          ...stat,
          player: {
            name: `${player.firstName} ${player.lastName}`,
            position: player.teams[0]!.position!,
          },
        }));
    }),
  allMatchesWithStats: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      return await ctx.db.query.matches.findMany({
        columns: { id: true, date: true, opponent: true, score: true },
        where: (matches, { eq }) => eq(matches.teamId, teamId),
        orderBy: (matches, { desc }) => desc(matches.date),
        with: { stats: { columns: { id: true, code: true } } },
      });
    }),
  shareTo: protectedProcedure
    .input(z.object({ teamId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, userId } = input;

      await ctx.db.insert(usersToTeams).values({
        teamId,
        userId,
        role: "shared",
      });
    }),
  revokeUserAccess: protectedProcedure
    .input(z.object({ userId: z.string(), teamId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, teamId } = input;

      await ctx.db
        .delete(usersToTeams)
        .where(
          and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
        );
    }),
  shared: protectedProcedure
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
  playerStats: protectedProcedure
    .input(z.object({ playerId: z.string(), teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { playerId, teamId } = input;

      const selectedStats = await ctx.db
        .select({
          id: stats.id,
          code: stats.code,
          set: stats.set,
          player: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            position: usersToTeams.position,
          },
        })
        .from(stats)
        .innerJoin(matches, eq(stats.matchId, matches.id))
        .innerJoin(users, eq(stats.playerId, users.id))
        .innerJoin(
          usersToTeams,
          and(
            eq(usersToTeams.userId, users.id),
            eq(usersToTeams.teamId, matches.teamId),
          ),
        )
        .where(and(eq(stats.playerId, playerId), eq(matches.teamId, teamId)));

      const formatted = selectedStats.map(({ player, ...stat }) => ({
        ...stat,
        player: {
          name: `${player.firstName} ${player.lastName}`,
          position: player.position!,
        },
      }));

      return formatted;
    }),
});
