import { BuildSession } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~env/server.mjs";
import { adminProcedure, protectedProcedure, router } from "../trpc";

const calculateHoursFromListOfSessions = (sessions: BuildSession[]) => {
  const hours = sessions.reduce((acc, session) => {
    if (!session.endAt) return acc;

    const diff = session.endAt.getTime() - session.startAt.getTime();
    const hours = diff / 1000 / 60 / 60;
    return acc + hours;
  }, 0);
  return hours;
};

export const leaderboardRouter = router({
  all: adminProcedure.query(async ({ ctx }) => {
    // alright a bit of a proceedure needs to happen here.
    // we need to get all the sessions, and then group it by user
    // once we have it grouped by user, we should count the number of hours in each session

    // grab all the users
    const users = await ctx.prisma.user.findMany({
      include: {
        buildSessions: true,
      },
    });

    const usersWithHours = users.map((user) => {
      const hours = calculateHoursFromListOfSessions(user.buildSessions);

      return {
        ...user,
        hours,
      };
    });

    return usersWithHours;
  }),

  byUser: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    if (
      !(ctx.session.user.id === input) &&
      !(ctx.session.user.email === env.ADMIN_EMAIL)
    )
      throw new TRPCError({ code: "UNAUTHORIZED" });

    const user = await ctx.prisma.user.findUnique({
      where: { id: input },
      include: {
        buildSessions: true,
      },
    });

    if (!user) return null;

    const hours = calculateHoursFromListOfSessions(user.buildSessions);

    return {
      ...user,
      hours,
    };
  }),
});
