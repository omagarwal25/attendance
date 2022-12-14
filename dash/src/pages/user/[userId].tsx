import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { BuildSessionTable } from "~components/BuildSessionTable";
import { LoadingPage } from "~components/LoadingPage";
import { trpc } from "~utils/trpc";

export default function UserPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { data, status } = useSession();

  // TODO flash something to indicate the status of the user's RFIDs

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
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2">
        <p className="col-span-2 flex flex-col items-start">
          <h1 className="text-2xl">
            {sessions[0]?.user.email}&apos;s Sessions
          </h1>
          Yellow Means Manually Edited
        </p>
        <BuildSessionTable sessions={sessions} />
        <h2 className="p-2">
          Total Hours: {leaderboard.data.hours.toFixed(2)}
        </h2>
      </div>
    </div>
  );
}
