import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~env/server.mjs";
import { requestSchema } from "~models/request";
import { createTransport, hoursRequestEmail } from "~utils/email";
import { adminProcedure, protectedProcedure, router } from "../trpc";
import { BuildSession, User } from "@prisma/client";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & Record<string, never>;

type FullReqeust = Prettify<z.infer<typeof requestSchema> & { type: "FULL" }>;
type OutRequest = Prettify<z.infer<typeof requestSchema> & { type: "OUT" }>;
type RequestWithSessionAndUser = (
  | FullReqeust
  | (OutRequest & { session: BuildSession })
) & { user: User; id: string };

export const requestsRouter = router({
  all: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.request.findMany({
      include: { user: true, session: true },
    });

    return data as unknown[] as RequestWithSessionAndUser[];
  }),

  allPending: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.request.findMany({
      include: { user: true, session: true },
      where: { status: "PENDING" },
    });

    return data as unknown[] as RequestWithSessionAndUser[];
  }),

  byUser: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    if (ctx.session.user.isAdmin || ctx.session.user.id === input) {
      return ctx.prisma.request.findMany({
        where: { userId: input },
        include: { user: true, session: true },
      });
    } else {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),

  pendingByUser: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.isAdmin || ctx.session.user.id === input) {
        const data = await ctx.prisma.request.findMany({
          where: { userId: input, status: "PENDING" },
          include: { user: true, session: true },
        });

        return data as unknown[] as RequestWithSessionAndUser[];
      } else {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),

  deny: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.request.update({
        where: { id: input },
        data: { status: "DENIED" },
      });
    }),

  approveAll: adminProcedure.mutation(async ({ ctx }) => {
    const requests = await ctx.prisma.request.findMany({
      where: { status: "PENDING" },
      include: { user: true, session: true },
    });

    // approve all

    for (const request of requests) {
      if (request.status === "ACCEPTED") {
        continue;
      }

      if (request.type === "FULL") {
        if (!request.startAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date is required session requests",
          });
        }

        if (request.startAt.getTime() > request.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        await ctx.prisma.request.update({
          where: { id: request.id },
          data: { status: "ACCEPTED" },
        });

        await ctx.prisma.buildSession.create({
          data: {
            user: { connect: { id: request.userId } },
            startAt: request.startAt,
            endAt: request.endAt,
            requests: { connect: { id: request.id } },
            manual: true,
          },
        });

        continue;
      } else {
        const session = request.session;

        if (!session) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Session is required for build requests",
          });
        }

        if (session.startAt.getTime() > request.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        await ctx.prisma.request.update({
          where: { id: request.id },
          data: {
            status: "ACCEPTED",
          },
        });

        await ctx.prisma.request.updateMany({
          where: {
            sessionId: request.sessionId,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        });

        await ctx.prisma.buildSession.update({
          where: { id: session.id },
          data: {
            endAt: request.endAt,
            manual: true,
          },
        });
      }
    }
  }),

  approve: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.request.findUnique({
        where: { id: input },
        include: { user: true, session: true },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (request.status === "ACCEPTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request is already approved",
        });
      }

      const type = request.type;

      if (type === "FULL") {
        if (!request.startAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date is required session requests",
          });
        }

        if (request.startAt.getTime() > request.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        await ctx.prisma.request.update({
          where: { id: input },
          data: { status: "ACCEPTED" },
        });

        await ctx.prisma.buildSession.create({
          data: {
            user: { connect: { id: request.userId } },
            startAt: request.startAt,
            endAt: request.endAt,
            requests: { connect: { id: request.id } },
            manual: true,
          },
        });

        return;
      } else {
        const session = request.session;

        if (!session) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Session is required for build requests",
          });
        }

        if (session.startAt.getTime() > request.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        await ctx.prisma.request.update({
          where: { id: input },
          data: {
            status: "ACCEPTED",
          },
        });

        await ctx.prisma.request.updateMany({
          where: {
            sessionId: request.sessionId,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        });

        await ctx.prisma.buildSession.update({
          where: { id: session.id },
          data: {
            endAt: request.endAt,
            manual: true,
          },
        });
      }
    }),

  create: protectedProcedure
    .input(requestSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.type === "FULL") {
        if (input.startAt.getTime() > input.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        const req = await ctx.prisma.request.create({
          data: {
            user: { connect: { id: ctx.session.user.id } },
            type: input.type,
            startAt: input.startAt,
            endAt: input.endAt,
          },
        });

        console.log(env.NEXTAUTH_URL);

        const acceptUrl = `${env.NEXTAUTH_URL}/requests/${req.id}/accept`;
        const denyUrl = `${env.NEXTAUTH_URL}/requests/${req.id}/deny`;

        await createTransport().sendMail({
          from: env.EMAIL_FROM, // sender address
          to: env.APPROVER_EMAIL, // list of receivers
          subject: `Hours request from ${ctx.session.user.email}`, // Subject line
          html: hoursRequestEmail({
            acceptUrl,
            denyUrl,
            email: ctx.session.user.email,
            startAt: input.startAt,
            endAt: input.endAt,
          }),
        });

        return;
      } else {
        const session = await ctx.prisma.buildSession.findUnique({
          where: { id: input.sessionId },
        });

        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (session.startAt.getTime() > input.endAt.getTime()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }

        const req = await ctx.prisma.request.create({
          data: {
            user: { connect: { id: ctx.session.user.id } },
            type: input.type,
            endAt: input.endAt,
            session: { connect: { id: input.sessionId } },
          },
        });

        const acceptUrl = `${env.NEXTAUTH_URL}/requests/${req.id}/accept`;
        const denyUrl = `${env.NEXTAUTH_URL}/requests/${req.id}/deny`;

        await createTransport().sendMail({
          from: env.EMAIL_FROM, // sender address
          to: env.APPROVER_EMAIL, // list of receivers
          subject: `Hours request from ${ctx.session.user.email}`, // Subject line
          html: hoursRequestEmail({
            acceptUrl,
            denyUrl,
            email: ctx.session.user.email,
            startAt: session.startAt,
            endAt: input.endAt,
          }),
        });
      }
    }),

  cancel: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.request.findUnique({
        where: { id: input },
        include: { user: true },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.session.user.id !== request.userId && !ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.request.update({
        where: { id: input },
        data: { status: "CANCELLED" },
      });
    }),

  purge: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.request.deleteMany({});
  }),
});
