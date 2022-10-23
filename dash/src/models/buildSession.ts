import { z } from "zod";

export const buildSessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  startAt: z.date(),
  endAt: z.date().optional().nullable(),
  manual: z.boolean().optional(),
});
