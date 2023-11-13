import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { colors } from "~utils/color";
import { protectedProcedure, router } from "../trpc";
import { adminProcedure } from "./../trpc";

export const userRouter = router({
  byId: adminProcedure.input(z.string().cuid()).query(({ ctx, input: id }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }),

  all: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  allEmails: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({ select: { id: true, email: true } });
  }),

  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.buildSession.deleteMany({ where: { userId: input } });
    await ctx.prisma.tag.deleteMany({ where: { userId: input } });
    await ctx.prisma.session.deleteMany({ where: { userId: input } });
    await ctx.prisma.user.delete({ where: { id: input } });
  }),

  registerTag: protectedProcedure
    .input(z.enum(colors).array())
    .mutation(async ({ ctx, input }) => {
      const seq = input.join(",");

      const tag = await ctx.prisma.tag.findFirst({
        where: {
          sequence: seq,
          user: null,
        },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          tag: {
            connect: {
              id: tag.id,
            },
          },
        },
      });
    }),
});
