import { useSession } from "next-auth/react";
import Link from "next/link";
import { BuildSessionTable } from "~components/BuildSessionTable";
import { ConfirmationModal } from "~components/ConfirmationModal";
import { LoadingPage } from "~components/LoadingPage";
import { trpc } from "~utils/trpc";

export default function AdminPage() {
  const { data, status } = useSession();

  // TODO flash something to indicate the status of the user's RFIDs

  const buildSessions = trpc.buildSession.all.useQuery();
  const leaderboard = trpc.leaderboard.all.useQuery();
  const deleteAllSessions = trpc.buildSession.purge.useMutation();

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

  const leaderboardSorted = [...leaderboard.data].sort(
    (a, b) => b.hours - a.hours
  );

  return (
    <div className="p-2">
      <h1 className="text-3xl">Admin</h1>
      {/* <Downloads /> */}
      <div className="grid grid-cols-2 gap-2">
        <p className="flex flex-col items-start">
          <h1 className="text-2xl">All Sessions</h1>
          Yellow Means Manually Edited
        </p>
        <p className="flex flex-col items-start">
          <h1 className="text-2xl">Leaderboard</h1>
        </p>
        <ConfirmationModal
          title="Delete All Sessions?"
          confirmButtonClass="bg-red-500 text-white"
          cancelButtonLabel="Cancel"
          confirmButtonLabel="Delete All Sessions"
          openButtonLabel="Delete All Sessions"
          description="This will delete all sessions. This is not reversible."
          onConfirm={() => deleteAllSessions.mutateAsync()}
        />{" "}
        <BuildSessionTable sessions={sessions} />
        {/* <h2 className="p-2">
          Total Hours: {leaderboard.data.hours.toFixed(2)}
        </h2> */}
        <div>
          <table className="w-full table-auto">
            <thead className="bg-gray-300">
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardSorted.map((user) => (
                <tr key={user.id} className="odd:bg-gray-200 even:bg-gray-100">
                  <td>{leaderboardSorted.indexOf(user) + 1}</td>
                  <td className="underline">
                    <Link href={`/user/${user.id}`}>{user.email}</Link>
                  </td>
                  <td>{user.hours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
