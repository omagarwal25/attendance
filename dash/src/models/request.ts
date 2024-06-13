import { z } from "zod";

const fullRequestSchema = z.object({
  type: z.enum(["FULL"]),
  startAt: z.date(),
  endAt: z.date(),
});

const outRequestSchema = z.object({
  type: z.enum(["OUT"]),
  endAt: z.date(),
  sessionId: z.string().cuid(),
});

export const requestSchema = z.union([fullRequestSchema, outRequestSchema]);
