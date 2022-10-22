// src/server/trpc/router/_app.ts
import { router } from "../trpc";

import { buildSessionRouter } from "./buildSession";
import { leaderboardRouter } from "./leaderboard";

export const appRouter = router({
  leaderboard: leaderboardRouter,
  buildSession: buildSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
