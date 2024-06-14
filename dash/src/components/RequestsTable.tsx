import { FC } from "react";
import { LoadingPage } from "./LoadingPage";
import { RouterOutput, trpc } from "~utils/trpc";
import { useRouter } from "next/router";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useSession } from "next-auth/react";

export const RequestsTable: FC<{
  requests: RouterOutput["requests"]["all"];
}> = ({ requests }) => {
  return (
    <div className="flex flex-col items-start self-start">
      <h1 className="text-2xl">Reqeusts</h1>
      <div className="flex w-full flex-col gap-2">
        <table className="w-full table-auto">
          <thead className="bg-gray-300">
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Type</th>
              <th>Start At</th>
              <th>End At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <RequestsRow key={request.id} request={request} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RequestsRow: FC<{ request: RouterOutput["requests"]["all"][number] }> = ({
  request,
}) => {
  const approve = trpc.requests.approve.useMutation();
  const deny = trpc.requests.deny.useMutation();

  const cancel = trpc.requests.cancel.useMutation();

  const router = useRouter();
  const trpcUtils = trpc.useUtils();
  const session = useSession();

  if (!session.data || !session.data.user) {
    return <div>Unauthorized</div>;
  }

  const isAdmin = session.data.user.isAdmin;

  const startTime =
    request.type === "OUT" ? request.session.startAt : request.startAt;
  const endTime = request.endAt;

  const handleApprove = () => {
    approve.mutateAsync(request.id);

    trpcUtils.requests.invalidate();
    trpcUtils.buildSession.invalidate();
    trpcUtils.leaderboard.invalidate();

    router.reload();
  };

  const handleDeny = () => {
    deny.mutateAsync(request.id);

    trpcUtils.requests.invalidate();
    trpcUtils.buildSession.invalidate();
    trpcUtils.leaderboard.invalidate();

    router.reload();
  };

  const handleCancel = () => {
    cancel.mutateAsync(request.id);

    trpcUtils.requests.invalidate();
    trpcUtils.buildSession.invalidate();
    trpcUtils.leaderboard.invalidate();

    router.reload();
  };

  return (
    <tr key={request.id} className="odd:bg-gray-200 even:bg-gray-100">
      <td>
        <Link className="underline" href={`/user/${request.user.id}`}>
          {request.user.email}
        </Link>
      </td>
      <td>{new Date(endTime).toLocaleDateString()}</td>
      <td>{request.type === "OUT" ? "Sign Out" : "Full Session"}</td>
      <td>
        {new Date(startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td>
        {new Date(endTime).toLocaleTimeString([], {
          minute: "2-digit",
          hour: "2-digit",
        })}
      </td>
      <td>
        <span className="flex items-center">
          {isAdmin ? (
            <>
              <Icon
                icon="heroicons:x-circle-solid"
                className="cursor-pointer text-2xl text-red-800"
                onClick={handleDeny}
              />
              <Icon
                icon="heroicons:check-circle-solid"
                className="cursor-pointer text-2xl text-green-800"
                onClick={handleApprove}
              />
            </>
          ) : (
            <Icon
              icon="heroicons:trash-solid"
              className="cursor-pointer text-2xl text-red-800"
              onClick={handleCancel}
            />
          )}
        </span>
      </td>
    </tr>
  );
};
