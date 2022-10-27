import { trpc } from "~utils/trpc";

export const Downloads = () => {
  const leaderboard = trpc.leaderboard.all.useQuery();
  const buildSession = trpc.buildSession.all.useQuery();

  if (leaderboard.status === "loading" || buildSession.status === "loading") {
    return <div>Loading...</div>;
  }

  if (!leaderboard.data || !buildSession.data) {
    return <div>Something went wrong</div>;
  }

  // turn the sessions and leaderboard into a csv

  // bruh. why isn't the csv export working

  const leaderboardCsv =
    "data:text/csv;charset=utf-8," +
    leaderboard.data.map((l) => [l.email, l.hours].join(",")).join("\r\n");

  const buildSessionCsv =
    "data:text/csv;charset=utf-8," +
    buildSession.data
      .map((s) =>
        [
          s.user.email,
          s.startAt.getTime(),
          s.endAt?.getTime() ?? "None",
          s.manual,
        ].join(",")
      )
      .join("\r\n");

  console.log(leaderboardCsv);
  console.log(buildSessionCsv);

  return (
    <div className="flex gap-1">
      <a
        href={leaderboardCsv}
        download="leaderboard.csv"
        className="rounded-md bg-blue-600 p-2 text-white"
      >
        Download Leaderboard
      </a>
      <a
        href={buildSessionCsv}
        download="buildSessions.csv"
        className="rounded-md bg-blue-600 p-2 text-white"
      >
        Download Build Sessions
      </a>
    </div>
  );
};
