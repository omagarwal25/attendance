import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Nav = () => {
  // Simple Nav with button to visit user page, and signin / signout

  const { data: session, status } = useSession();

  const signedIn = status === "authenticated" && session;

  return (
    <nav className="flex flex-wrap items-center justify-between bg-gray-800 p-4">
      <div className="mr-6 flex w-full flex-shrink-0 items-center gap-2 text-white">
        <span className="grow text-xl font-semibold tracking-tight">
          Attendance App
        </span>
        {/** If Signed in Show Signout, otherwise show signout */}
        {signedIn ? (
          <>
            <button
              className="justify-end rounded bg-red-500 p-2"
              onClick={() => signOut()}
            >
              Sign Out ({session.user?.email})
            </button>
            <button>
              <Link href="/user/[userId]" as={`/user/${session.user?.id}`}>
                <a>See My Hours</a>
              </Link>
            </button>
          </>
        ) : (
          <button
            className="justify-end bg-blue-500 p-2"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};
