// src/pages/_app.tsx
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import Head from "next/head";
import { Nav } from "~components/Nav";
import "~styles/globals.css";
import { trpc } from "~utils/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Griffins Attendance</title>
        <meta name="description" content="Tap in and Out :)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
