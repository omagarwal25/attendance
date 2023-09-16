import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { BuildSessionTable } from "~components/BuildSessionTable";
import { ConfirmationModal } from "~components/ConfirmationModal";
import { LoadingPage } from "~components/LoadingPage";
import { Color } from "~utils/color";
import { trpc } from "~utils/trpc";

export default function UserPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { data, status } = useSession();

  const buildSessions = trpc.buildSession.byUser.useQuery(userId as string);
  const leaderboard = trpc.leaderboard.byUser.useQuery(userId as string);
  const registerTag = trpc.user.registerTag.useMutation();
  const deleteUser = trpc.user.delete.useMutation();

  if (
    status === "loading" ||
    buildSessions.status === "loading" ||
    leaderboard.status === "loading" ||
    registerTag.status === "loading"
  ) {
    return <LoadingPage />;
  }

  if (
    (buildSessions.isError && buildSessions.error) ||
    (leaderboard.isError && leaderboard.error) ||
    (registerTag.isError && registerTag.error)
  ) {
    if (
      buildSessions.error?.data?.code === "UNAUTHORIZED" ||
      leaderboard.error?.data?.code === "UNAUTHORIZED" ||
      registerTag.error?.data?.code === "UNAUTHORIZED"
    ) {
      return <div>Unauthorized</div>;
    } else return <div>Error</div>;
  }

  if (!data) return <LoadingPage />;
  if (!buildSessions.data) return <LoadingPage />;
  if (!leaderboard.data) return <LoadingPage />;
  // if (!registerTag.data) return <LoadingPage />;

  const sessions = [...buildSessions.data].sort((a, b) => {
    if (a.startAt < b.startAt) return 1;
    if (a.startAt > b.startAt) return -1;
    return 0;
  });

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2">
        <p className="flex flex-col items-start">
          <h1 className="text-2xl">
            {sessions[0]?.user.email}&apos;s Sessions
          </h1>
          Yellow Means Manually Edited
          <BuildSessionTable sessions={sessions} />
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="p-2">
            Total Hours: {leaderboard.data.hours.toFixed(2)}
          </h2>
          {data?.user?.isAdmin && (
            <ConfirmationModal
              title="Delete User?"
              confirmButtonClass="bg-red-500 text-white"
              cancelButtonLabel="Cancel"
              confirmButtonLabel="Delete User"
              openButtonLabel="Delete User"
              description="This will delete this user. This is not reversible."
              onConfirm={() => deleteUser.mutateAsync(userId as string)}
            />
          )}
          <h2 className="p-2">Register New RFID:</h2>
          <ColorPicker submit={(colors) => registerTag.mutateAsync(colors)} />
        </div>
      </div>
    </div>
  );
}

const ColorPicker = ({ submit }: { submit: (color: Color[]) => void }) => {
  const [colors, setColors] = useState<Color[]>(["red", "red", "red"]);

  return (
    <div className="flex flex-row items-center gap-2 p-2">
      {colors.map((_, i) => (
        <select
          key={i}
          onChange={(e) => {
            const newColors = [...colors];
            newColors[i] = e.target.value as Color;
            setColors(newColors);
          }}
          className="rounded p-2"
          value={colors[i]}
        >
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="magenta">Magenta</option>
          <option value="cyan">Cyan</option>
        </select>
      ))}

      <button
        className="rounded bg-green-700 p-2 text-white"
        onClick={() => {
          submit(colors);
        }}
      >
        Go!
      </button>
    </div>
  );
};
