import { Icon } from "@iconify-icon/react";
import { BuildSession, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useState } from "react";
import CsvDownload from "react-csv-downloader";
import { getSessionsCSV, sessionsColumns } from "~utils/csv";
import { trpc } from "~utils/trpc";

type Row = BuildSession & { user: User };

export const BuildSessionTable: FC<{
  sessions: (BuildSession & { user: User })[];
}> = ({ sessions }) => {
  const { data } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);

  const isAdmin = data?.user?.isAdmin ?? false;
  const router = useRouter();
  const isOnUserPage = router.pathname === "/user/[userId]";

  const showUserColumn = !isOnUserPage && isAdmin;

  return (
    <div className="flex flex-col gap-2">

      <table className="w-full table-auto">
        <thead className="bg-gray-200">
          <tr>
            {showUserColumn && <th>User</th>}
            <th>Date</th>
            <th>Start At</th>
            <th>Start End</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <TableRow
              key={session.id}
              showUserColumn={showUserColumn}
              session={session}
              isAdmin={isAdmin}
            />
          ))}
          {isAdmin && !showAddForm && (
            <tr>
              <td colSpan={showUserColumn ? 5 : 4}>
                <div className="flex justify-center items-center">
                  <Icon
                    icon="heroicons:plus-circle-solid"
                    onClick={() => setShowAddForm(true)}
                    className="text-2xl cursor-pointer"
                  />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showAddForm && <CreateRow onClose={() => setShowAddForm(false)} />}
    </div >
  );
};

const EmailPicker: FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { data: users } = trpc.user.all.useQuery();

  // useEffect(() => {
  // onChange(users?.[0]?.email ?? "");
  // });

  if (!users) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md"
    >
      <option value="" disabled>
        Select User
      </option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.email}
        </option>
      ))}
    </select>
  );
};

const CreateRow: FC<{ onClose: () => void }> = ({ onClose }) => {
  const router = useRouter();

  // if the route is /user/[userId] then we need to get the userId from the route
  // otherwise user input
  const isOnUserPage = router.pathname === "/user/[userId]";
  const userId = isOnUserPage ? (router.query.userId as string) : null;

  const { mutateAsync } = trpc.buildSession.create.useMutation();
  const [buildSession, setBuildSession] = useState<{
    start: {
      hours: number;
      minutes: number;
    };
    end: {
      hours: number;
      minutes: number;
    } | null;
    date: Date;
    userId: string;
  }>({
    start: {
      hours: 0,
      minutes: 0,
    },
    end: null,
    // just the date no time
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    userId: userId ?? "",
  });

  const handleEndCheckbox = (target: ChangeEvent<HTMLInputElement>) => {
    if (!target.target.checked) {
      setBuildSession((prev) => ({
        ...prev,
        end: null,
      }));
    } else {
      setBuildSession((prev) => ({
        ...prev,
        end: {
          hours: 0,
          minutes: 0,
        },
      }));
    }
  };

  const onSubmit = async () => {
    // calculate the start and end time
    const start = new Date(buildSession.date);
    start.setHours(buildSession.start.hours, buildSession.start.minutes);

    const end = buildSession.end ? new Date(buildSession.date) : null;
    if (end && buildSession.end) {
      end.setHours(buildSession.end.hours, buildSession.end.minutes);
    }

    await mutateAsync({
      startAt: start,
      endAt: end,
      userId: buildSession.userId,
    });

    onClose();
    router.reload();
  };

  return (
    <div className="flex flex-col gap-2">
      {!isOnUserPage && (
        <p className="flex flex-col">
          <h1>
            Email:{" "}
            <EmailPicker
              value={buildSession.userId}
              onChange={(e) =>
                setBuildSession((prev) => ({ ...prev, userId: e }))
              }
            />
          </h1>
          {buildSession.userId === "" && (
            <span className="text-red-500">Please Select User</span>
          )}
        </p>
      )}

      <span>
        Date:{" "}
        <input
          type="date"
          value={buildSession.date.toISOString().split("T")[0]}
          className="rounded-md"
          onChange={(e) => {
            setBuildSession((prev) => ({
              ...prev,
              date: new Date(e.target.value),
            }));
          }}
        />
      </span>

      <span className="flex gap-2 items-center">
        {/** Because the built in time inputs are bad, let's use a set of 24 hour numeric */}
        Start Time:
        <input
          type="number"
          className="w-20 h-10 rounded-md"
          min={0}
          max={23}
          value={buildSession.start.hours}
          onChange={(e) => {
            setBuildSession((prev) => ({
              ...prev,
              start: {
                ...prev.start,
                hours: parseInt(e.target.value),
              },
            }));
          }}
        />
        :
        <input
          type="number"
          className="w-20 h-10 rounded-md"
          min={0}
          max={59}
          value={buildSession.start.minutes}
          onChange={(e) => {
            setBuildSession((prev) => ({
              ...prev,
              start: {
                ...prev.start,
                minutes: parseInt(e.target.value),
              },
            }));
          }}
        />
      </span>

      <span className="flex gap-2 items-center">
        <label htmlFor="end">Set End Time?</label>
        <input
          type="checkbox"
          name="Set End Time"
          className="rounded-md"
          id="end"
          onChange={handleEndCheckbox}
        />
      </span>

      {buildSession.end && (
        <span className="flex gap-2 items-center">
          End Time:{" "}
          <>
            <input
              type="number"
              className="w-20 h-10 rounded-md"
              min={0}
              max={23}
              value={buildSession.end.hours ?? 0}
              onChange={(e) => {
                if (buildSession.end) {
                  setBuildSession({
                    ...buildSession,
                    end: {
                      ...buildSession.end,
                      hours: parseInt(e.target.value),
                    },
                  });
                }
              }}
            />
            :
            <input
              type="number"
              className="w-20 h-10 rounded-md"
              min={0}
              max={59}
              value={buildSession.end.minutes}
              onChange={(e) => {
                if (buildSession.end) {
                  setBuildSession({
                    ...buildSession,
                    end: {
                      ...buildSession.end,
                      minutes: parseInt(e.target.value),
                    },
                  });
                }
              }}
            />
          </>
        </span>
      )}

      <span className="flex gap-2">
        <button
          className="flex gap-1 items-center p-2 text-white bg-red-800 rounded-md"
          onClick={onClose}
        >
          Cancel
          <Icon icon="heroicons:x-circle-solid" className="text-2xl" />
        </button>
        <button
          className="flex gap-1 items-center p-2 text-white bg-green-800 rounded-md disabled:cursor-not-allowed"
          disabled={buildSession.userId === ""}
          onClick={onSubmit}
        >
          Create
          <Icon icon="heroicons:check-circle-solid" className="text-2xl" />
        </button>
      </span>
    </div>
  );
};

const TableRow: FC<{
  session: Row;
  isAdmin: boolean;
  showUserColumn: boolean;
}> = ({ session, isAdmin, showUserColumn }) => {
  const [editMode, setEditMode] = useState(false);

  const deleteSession = trpc.buildSession.delete.useMutation();
  const router = useRouter();

  // if the edit mode is true we must have the start and end times be editable.

  return (
    <tr
      className={
        session.manual ? "bg-yellow-200" : "odd:bg-gray-200 even:bg-gray-100"
      }
    >
      {showUserColumn && (
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
              <span className="flex gap-1 items-center text-red-500">None</span>
            )}
          </td>
          {!isAdmin && (
            <span className="flex items-center">
              {!isAdmin && !session.endAt && (
                <Icon
                  icon="heroicons:pencil-square-20-solid"
                  className="text-2xl text-red-500 cursor-pointer"
                  onClick={() => setEditMode(true)}
                />
              )}
            </span>
          )}
          {isAdmin && (
            <>
              <span className="flex items-center">
                <Icon
                  icon="heroicons:pencil-square-solid"
                  className="text-2xl cursor-pointer"
                  onClick={() => setEditMode(true)}
                />

                <Icon
                  icon="heroicons:trash-solid"
                  className="text-2xl cursor-pointer"
                  onClick={async () => {
                    await deleteSession.mutateAsync(session.id);
                    router.reload();
                  }}
                />
              </span>
            </>
          )}
        </>
      ) : (
        <EditRow session={session} onCloseEdit={() => setEditMode(false)} />
      )}
    </tr>
  );
};

const EditRow: FC<{ session: Row; onCloseEdit: () => void }> = ({
  session,
  onCloseEdit,
}) => {
  // for the initial state we need to get the start and end times.

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
    if (endAt.hours !== 0 && endAt.minutes !== 0 && startAtDate > endAtDate) {
      alert("Start time must be before end time");
      return;
    }

    // send the request to the server.
    await mutate.mutateAsync({
      id: session.id,
      data: {
        startAt: startAtDate,
        endAt: endAt.hours !== 0 && endAt.minutes !== 0 ? null : endAtDate,
      },
    });

    onCloseEdit();
    router.reload();
  };

  return (
    <>
      <td>
        <span className="flex gap-2 items-center">
          {/** Because the built in time inputs are bad, let's use a set of 24 hour numeric */}
          <input
            type="number"
            className="w-20 h-10 rounded-md"
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
            className="w-20 h-10 rounded-md"
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
        <span className="flex gap-2 items-center">
          <input
            type="number"
            className="w-20 h-10 rounded-md"
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
            className="w-20 h-10 rounded-md"
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
      <td>
        <span className="flex items-center">
          <Icon
            icon="heroicons:x-circle-solid"
            className="text-2xl text-red-800 cursor-pointer"
            onClick={onCloseEdit}
          />
          <Icon
            icon="heroicons:check-circle-solid"
            className="text-2xl text-green-800 cursor-pointer"
            onClick={onSubmit}
          />
        </span>
      </td>
    </>
  );
};
