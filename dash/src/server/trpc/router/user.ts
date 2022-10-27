import { z } from "zod";
import { router } from "../trpc";
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
});
