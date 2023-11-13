import { useSession } from "next-auth/react";
import Link from "next/link";
import CsvDownload from "react-csv-downloader";
import { BuildSessionTable } from "~components/BuildSessionTable";
import { ConfirmationModal } from "~components/ConfirmationModal";
import { LoadingPage } from "~components/LoadingPage";
import {
  getLeaderboardCSV,
  getSessionsCSV,
  leaderboardColumns,
  sessionsColumns,
} from "~utils/csv";
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
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <p className="flex flex-col gap-2 self-start">
          <h1 className="text-2xl">All Sessions</h1>
          <p className="flex items-center gap-2">
            <ConfirmationModal
              title="Delete All Sessions?"
              confirmButtonClass="bg-red-500 text-white"
              cancelButtonLabel="Cancel"
              confirmButtonLabel="Delete All Sessions"
              openButtonLabel="Delete All Sessions"
              description="This will delete all sessions. This is not reversible."
              onConfirm={() => deleteAllSessions.mutateAsync()}
            />
            <CsvDownload
              columns={sessionsColumns}
              datas={() => getSessionsCSV(sessions)}
              filename={`sessions-${new Date().toISOString()}.csv`}
            >
              <button className="rounded bg-blue-500 p-3 text-white hover:bg-blue-700">
                Download CSV
              </button>
            </CsvDownload>
          </p>
          <BuildSessionTable sessions={sessions} showDelButton={false} />
        </p>
      </div>
    </div>
  );
}
