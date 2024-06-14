import { BuildSession, User } from ".prisma/client";
import { RouterOutput } from "./trpc";

type SessionRow = BuildSession & { user: User };

export const getSessionsCSV = (table: SessionRow[]) => {
  return table.map(({ startAt, endAt, user, manual }) => ({
    startAt: startAt?.toISOString(),
    endAt: endAt?.toISOString(),
    email: user.email,
    manual: manual ? "true" : "false",
  }));
};

export const sessionsColumns = [
  {
    id: "startAt",
    displayName: "Start At",
  },
  {
    id: "endAt",
    displayName: "End At",
  },
  { id: "email", displayName: "Email" },
  { id: "manual", displayName: "Manual" },
];

type LeaderboardRow = RouterOutput["leaderboard"]["all"][number];

export const getLeaderboardCSV = (table: LeaderboardRow[]) => {
  return table.map(({ id, email, hours }) => ({
    id,
    email,
    hours: hours.toFixed(2),
  }));
};

export const leaderboardColumns = [
  {
    id: "id",
    displayName: "ID",
  },
  {
    id: "email",
    displayName: "Email",
  },
  { id: "hours", displayName: "Hours" },
];
