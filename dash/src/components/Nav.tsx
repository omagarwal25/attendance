import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Nav = () => {
  // Simple Nav with button to visit user page, and signin / signout

  const { data: session, status } = useSession();

  const signedIn = status === "authenticated" && session;
  const isAdmin = session?.user?.isAdmin ?? false;

  return (
    <nav className="flex flex-wrap items-center justify-between bg-gray-800 p-4">
      <div className="mr-6 flex w-full flex-shrink-0 items-center gap-2 text-white">
        <Link href="/" passHref>
          <a className="grow text-xl font-semibold tracking-tight">
            Attendance App
          </a>
        </Link>
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
              <Link href={`/user/${session.user?.id}`}>See My Hours</Link>
            </button>
          </>
        ) : (
          <button
            className="justify-end rounded bg-blue-500 p-2"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        )}
        {isAdmin && <Link href="/admin">Admin</Link>}
        {isAdmin && <Link href="/mannual">Mannual</Link>}
      </div>
    </nav>
  );
};
