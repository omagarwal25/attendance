// src/server/trpc/router/_app.ts
import { router } from "../trpc";

import { buildSessionRouter } from "./buildSession";
import { leaderboardRouter } from "./leaderboard";
import { userRouter } from "./user";

export const appRouter = router({
  leaderboard: leaderboardRouter,
  buildSession: buildSessionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
