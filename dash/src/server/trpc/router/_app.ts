// src/server/trpc/router/_app.ts
import { router } from "../trpc";

import { buildSessionRouter } from "./buildSession";
import { leaderboardRouter } from "./leaderboard";
import { requestsRouter } from "./requests";
import { userRouter } from "./user";

export const appRouter = router({
  buildSession: buildSessionRouter,
  user: userRouter,
  requests: requestsRouter,
  leaderboard: leaderboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
