import { Icon } from "@iconify-icon/react";
import { BuildSession, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { trpc } from "~utils/trpc";

type Row = BuildSession & { user: User };

export const BuildSessionTable: FC<{
  sessions: (BuildSession & { user: User })[];
}> = ({ sessions }) => {
  const { data } = useSession();

  const isAdmin = data?.user?.isAdmin ?? false;

  return (
    <table className="table-auto">
      <thead>
        <tr>
          {isAdmin && <th>User</th>}
          <th>Date</th>
          <th>Start At</th>
          <th>Start End</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <BuildSessionTableRow
            key={session.id}
            session={session}
            isAdmin={isAdmin}
          />
        ))}
      </tbody>
    </table>
  );
};

const BuildSessionTableRow: FC<{ session: Row; isAdmin: boolean }> = ({
  session,
  isAdmin,
}) => {
  const [editMode, setEditMode] = useState(false);

  const deleteSession = trpc.buildSession.delete.useMutation();
  const router = useRouter();

  // if the edit mode is true we must have the start and end times be editable.

  return (
    <tr>
      {isAdmin && (
        <td>
          <Link href={`/user/${session.user.id}`}>
            <a className="underline">{session.user.email}</a>
          </Link>
        </td>
      )}
      <td>{new Date(session.startAt).toLocaleDateString()}</td>
      {!editMode ? (
        <>
          <td>
            {new Date(session.startAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td>
            {session.endAt ? (
              new Date(session.endAt).toLocaleTimeString([], {
                minute: "2-digit",
                hour: "2-digit",
              })
            ) : (
              <>
                <span className="flex items-center gap-1 text-red-500">
                  None
                  {!isAdmin && (
                    <Icon
                      icon="heroicons:pencil-square-20-solid"
                      onClick={() => setEditMode(true)}
                    />
                  )}
                </span>
                {/** Make this ediable eventually */}
              </>
            )}
          </td>
          {isAdmin && (
            <Icon
              icon="heroicons:pencil-square-solid"
              className="cursor-pointer text-2xl"
              onClick={() => setEditMode(true)}
            />
          )}
          {isAdmin && (
            <Icon
              icon="heroicons:trash-solid"
              className="cursor-pointer text-2xl"
              onClick={async () => {
                await deleteSession.mutate(session.id);
                router.reload();
              }}
            />
          )}
        </>
      ) : (
        <EditableStartAndEnd
          session={session}
          onCloseEdit={() => setEditMode(false)}
        />
      )}
    </tr>
  );
};

const EditableStartAndEnd: FC<{ session: Row; onCloseEdit: () => void }> = ({
  session,
  onCloseEdit,
}) => {
  // for the inital state we need to get the start and end times.

  const [startAt, setStartAt] = useState({
    hours: session.startAt.getHours(),
    minutes: session.startAt.getMinutes(),
  });
  const [endAt, setEndAt] = useState(
    session.endAt
      ? { hours: session.endAt.getHours(), minutes: session.endAt.getMinutes() }
      : { hours: 0, minutes: 0 }
  );
  const router = useRouter();

  const mutate = trpc.buildSession.edit.useMutation();

  const onSubmit = async () => {
    const startAtDate = new Date(session.startAt);
    startAtDate.setHours(startAt.hours);
    startAtDate.setMinutes(startAt.minutes);

    const endAtDate = new Date(session.startAt);
    endAtDate.setHours(endAt.hours);
    endAtDate.setMinutes(endAt.minutes);

    // verify that the start time is before the end time.
    if (endAt && startAtDate > endAtDate) {
      alert("Start time must be before end time");
      return;
    }

    // send the request to the server.
    await mutate.mutateAsync({
      id: session.id,
      data: {
        startAt: startAtDate,
        endAt: endAtDate,
      },
    });

    onCloseEdit();
    router.reload();
  };

  return (
    <>
      <td>
        <span className="flex items-center gap-2">
          {/** Because the built in time inputs are bad, let's use a set of 24 hour numeric */}
          <input
            type="number"
            className="h-10 w-20 rounded-md"
            min={0}
            max={23}
            value={startAt.hours}
            onChange={(e) => {
              setStartAt((prev) => ({
                ...prev,
                hours: parseInt(e.target.value),
              }));
            }}
          />
          :
          <input
            type="number"
            className="h-10 w-20 rounded-md"
            min={0}
            max={59}
            value={startAt.minutes}
            onChange={(e) => {
              setStartAt((prev) => ({
                ...prev,
                minutes: parseInt(e.target.value),
              }));
            }}
          />
        </span>
      </td>
      <td>
        <span className="flex items-center gap-2">
          <input
            type="number"
            className="h-10 w-20 rounded-md"
            min={0}
            max={23}
            value={endAt.hours}
            onChange={(e) => {
              setEndAt((prev) => ({
                ...prev,
                hours: parseInt(e.target.value),
              }));
            }}
          />
          :
          <input
            type="number"
            className="h-10 w-20 rounded-md"
            min={0}
            max={59}
            value={endAt.minutes}
            onChange={(e) => {
              setEndAt((prev) => ({
                ...prev,
                minutes: parseInt(e.target.value),
              }));
            }}
          />
        </span>
      </td>
      <Icon
        icon="heroicons:check-circle-solid"
        className="cursor-pointer text-2xl text-green-800"
        onClick={onSubmit}
      />
    </>
  );
};
