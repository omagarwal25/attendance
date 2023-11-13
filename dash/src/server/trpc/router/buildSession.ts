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
    if (ctx.session.user.isAdmin || ctx.session.user.id === input) {
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
        !env.ADMIN_EMAIL.includes(ctx.session.user.email) &&
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

  digitalTap: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {

    const session = await ctx.prisma.buildSession.findFirst({
      where: {
        manual: true,
        user: {
          email: input,
        },
        startAt: {
          // the start is today
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        // the end is null
        endAt: null,
      },
    });

    // if the session is null, then we need to create a new session
    if (!session) {
      await ctx.prisma.buildSession.create({
        data: {
          startAt: new Date(),
          user: {
            connect: {
              email: input,
            }
          }
        },
      });

      return
    } else {
      // otherwise we need to end the session
      await ctx.prisma.buildSession.update({
        where: {
          id: session.id,
        },
        data: {
          endAt: new Date(),
        },
      });

      return
    }

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

  purge: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.buildSession.deleteMany({});
  }),
});
