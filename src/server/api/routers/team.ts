import { teams, users, usersToTeams } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { count, eq } from "drizzle-orm";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ name: z.string(), profilePicture: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, profilePicture } = input;

      const insertedTeams = await ctx.db
        .insert(teams)
        .values({ name, profilePicture })
        .returning({ teamId: teams.id });

      await ctx.db.insert(usersToTeams).values({
        teamId: insertedTeams[0]!.teamId,
        userId: ctx.session.user.id,
        role: "owner",
      });
    }),
  listMemberOf: protectedProcedure.query(async ({ ctx }) => {
    const selectedTeams = await ctx.db.query.teams.findMany({
      columns: {
        id: true,
        name: true,
        profilePicture: true,
      },
      with: {
        users: {
          columns: { role: true },
          where: (usersToTeams, { eq }) =>
            eq(usersToTeams.userId, ctx.session.user.id),
        },
      },
    });

    return await Promise.all(
      selectedTeams.map(async (team) => {
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
});
