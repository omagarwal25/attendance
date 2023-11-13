import { FC, useState } from "react";

import { trpc } from "~utils/trpc";

export default function AdminPage() {
  const { mutateAsync } = trpc.buildSession.digitalTap.useMutation();
  const [userId, setUserId] = useState("");

  return (
    <div className="p-2">
      <h1 className="text-3xl">Admin</h1>
      {/* <Downloads /> */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <p className="flex flex-col gap-2 self-start">
          <p className="flex flex-col">
            <h1>
              Email:{" "}
              <EmailPicker value={userId} onChange={(e) => setUserId(e)} />
            </h1>
            {userId === "" && (
              <span className="text-red-500">Please Select User</span>
            )}
          </p>
        </p>
      </div>

      <button className="p-2 bg-green-500 rounded-md" onClick={() => mutateAsync(userId)}>Tap</button>
    </div>
  );
}

const EmailPicker: FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { data: users } = trpc.user.allEmails.useQuery();

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
