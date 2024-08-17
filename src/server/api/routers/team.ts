import { teams, users, usersToTeams } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { count, eq } from "drizzle-orm";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const insertedTeams = await ctx.db
        .insert(teams)
        .values({ name })
        .returning({ teamId: teams.id });

      await ctx.db.insert(usersToTeams).values({
        teamId: insertedTeams[0]!.teamId,
        userId: ctx.session.user.id,
        role: "owner",
      });
    }),
  listMemberOf: protectedProcedure.query(async ({ ctx }) => {
    const selectedTeams = await ctx.db
      .select({
        id: teams.id,
        name: teams.name,
        playerCount: count(),
      })
      .from(usersToTeams)
      .leftJoin(users, eq(usersToTeams.userId, users.id))
      .leftJoin(teams, eq(usersToTeams.teamId, teams.id))
      .where(eq(users.id, ctx.session.user.id))
      .all();

    return selectedTeams[0]?.id ? selectedTeams : [];

    // return await ctx.db.query.teams.findMany({
    //   columns: { id: true, name: true },
    //   with: {
    //     users: {
    //       where: eq(usersToTeams.userId, ctx.session.user.id),
    //     },
    //   },
    // });
  }),
});
