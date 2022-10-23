import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { BuildSessionTable } from "~components/BuildSessionTable";
import { LoadingPage } from "~components/LoadingPage";
import { trpc } from "~utils/trpc";

export default function UserPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { data, status } = useSession();

  const buildSessions = trpc.buildSession.byUser.useQuery(userId as string);
  const leaderboard = trpc.leaderboard.byUser.useQuery(userId as string);

  if (
    status === "loading" ||
    buildSessions.status === "loading" ||
    leaderboard.status === "loading"
  ) {
    return <LoadingPage />;
  }

  if (
    (buildSessions.isError && buildSessions.error) ||
    (leaderboard.isError && leaderboard.error)
  ) {
    if (
      buildSessions.error?.data?.code === "UNAUTHORIZED" ||
      leaderboard.error?.data?.code === "UNAUTHORIZED"
    ) {
      return <div>Unauthorized</div>;
    }
  }

  if (!data) return <LoadingPage />;
  if (!buildSessions.data) return <LoadingPage />;
  if (!leaderboard.data) return <LoadingPage />;

  const sessions = [...buildSessions.data].sort((a, b) => {
    if (a.startAt < b.startAt) return 1;
    if (a.startAt > b.startAt) return -1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <span className="text-2xl">
        {sessions[0]?.user.email}&apos;s Sessions
      </span>
      <div className="grid grid-cols-2">
        <BuildSessionTable sessions={sessions} />
        Total Hours: {leaderboard.data.hours.toFixed(2)}
      </div>
    </div>
  );
}
