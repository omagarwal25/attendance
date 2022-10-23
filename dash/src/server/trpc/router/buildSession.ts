import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~env/server.mjs";
import { buildSessionSchema } from "~models/buildSession";
import { adminProcedure, protectedProcedure, router } from "../trpc";

export const buildSessionRouter = router({
  all: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.buildSession.findMany({ include: { user: true } });
  }),

  byUser: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    if (
      ctx.session.user.email === env.ADMIN_EMAIL ||
      ctx.session.user.id === input
    ) {
      return ctx.prisma.buildSession.findMany({
        where: { userId: input },
        include: { user: true },
      });
    } else {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: buildSessionSchema.omit({ id: true, manual: true }).partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // grab the session
      const session = await ctx.prisma.buildSession.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        ctx.session.user.email !== env.ADMIN_EMAIL &&
        ctx.session.user.id !== session.userId
      )
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const updatedSession = await ctx.prisma.buildSession.update({
        where: { id },
        data: { ...data, manual: true },
      });

      return updatedSession;
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const session = await ctx.prisma.buildSession.delete({
      where: { id: input },
    });
    return session;
  }),

  create: adminProcedure
    .input(buildSessionSchema.omit({ id: true, manual: true }))
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;
      const session = await ctx.prisma.buildSession.create({
        data: {
          ...data,
          manual: true,
          user: {
            connect: { id: userId },
          },
        },
      });
      return session;
    }),
});
