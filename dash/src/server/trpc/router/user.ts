import { TRPCError } from "@trpc/server";
import { z } from "zod";
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

  registerTag: protectedProcedure
    .input(z.enum(["purple", "green", "blue", "red", "orange"]).array())
    .mutation(async ({ ctx, input }) => {
      const seq = input.join(",");

      const tag = await ctx.prisma.tag.findFirst({
        where: {
          sequence: seq,
          user: null
        }
      })

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id
        },
        data: {
          tag: {
            connect: {
              id: tag.id
            }
          }
        }
      })
    }),
});
