import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~env/server.mjs";
import { requestSchema } from "~models/request";
import { createTransport, hoursRequestEmail } from "~utils/email";
import { adminProcedure, protectedProcedure, router } from "../trpc";

export const buildSessionRouter = router({
  all: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.request.findMany({
      include: { user: true, session: true },
    });
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

  cancel: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.request.findUnique({
        where: { id: input },
        include: { user: true },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.session.user.id !== request.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.request.update({
        where: { id: input },
        data: { status: "CANCELLED" },
      });
    }),

  deny: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.request.update({
        where: { id: input },
        data: { status: "DENIED" },
      });
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
            buildSessionRequests: { connect: { id: request.id } },
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

        await ctx.prisma.buildSession.update({
          where: { id: session.id },
          data: {
            endAt: request.endAt,
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

        const acceptUrl = `${env.NEXTAUTH_URL}/api/auth/requests/${req.id}/accept`;
        const denyUrl = `${env.NEXTAUTH_URL}/api/auth/requests/${req.id}/deny`;

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

        const acceptUrl = `${env.NEXTAUTH_URL}/api/auth/requests/${req.id}/accept`;
        const denyUrl = `${env.NEXTAUTH_URL}/api/auth/requests/${req.id}/deny`;

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

  purge: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.request.deleteMany({});
  }),
});
