import Image from "next/image";
import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { signIn } from "next-auth/react";
import Login from "~/components/Login";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  const hasNameAndSurname = session?.user.firstName && session?.user.lastName;

  return (
    <HydrateClient>
      <main className="text-primary flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-5xl">Hladstat</h1>
          {session ? <div>Witaj, {session.user.name}!</div> : <Login />}
        </div>
      </main>
    </HydrateClient>
  );
}
