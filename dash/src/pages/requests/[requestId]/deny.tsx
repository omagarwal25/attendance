import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~components/LoadingPage";
import { trpc } from "~utils/trpc";

export default function AcceptRequest() {
  const { data, status } = useSession();
  const { mutateAsync } = trpc.requests.deny.useMutation();
  const router = useRouter();

  const params = router.query as { requestId: string };

  // TODO flash something to indicate the status of the user's RFIDs

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!data) return <LoadingPage />;

  if (!data.user?.isAdmin) {
    return <div>Unauthorized</div>;
  }

  const handleDeny = async () => {
    await mutateAsync(params.requestId);

    router.push("/admin");
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl">Deny Request</h1>
      <button
        className="rounded-md bg-green-700 p-2 text-white"
        onClick={handleDeny}
      >
        Deny Request
      </button>
    </div>
  );
}
