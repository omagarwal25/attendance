import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { buildSessionSchema } from "../../../models/buildSession";
import { adminProcedure, protectedProcedure, router } from "../trpc";

export const buildSessionRouter = router({
  all: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.session.findMany({ include: { user: true } });
  }),

  byUser: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    if (
      ctx.session.user.email === env.ADMIN_EMAIL ||
      ctx.session.user.id === input
    ) {
      return ctx.prisma.session.findMany({
        where: { userId: input },
        include: { user: true },
      });
    } else {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),

  edit: adminProcedure
    .input(
      z
        .object({ id: z.string(), data: buildSessionSchema.omit({ id: true }) })
        .partial()
    )
    .query(async ({ ctx, input }) => {
      const { id, data } = input;
      const session = await ctx.prisma.buildSession.update({
        where: { id },
        data: { ...data },
      });
      return session;
    }),

  delete: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const session = await ctx.prisma.buildSession.delete({
      where: { id: input },
    });
    return session;
  }),

  create: adminProcedure
    .input(buildSessionSchema.omit({ id: true }))
    .query(async ({ ctx, input }) => {
      const { userId, ...data } = input;
      const session = await ctx.prisma.buildSession.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
        },
      });
      return session;
    }),
});
