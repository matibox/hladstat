import Link from "next/link";

import { buttonVariants } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Login from "~/components/Login";
import WelcomeForm from "~/components/WelcomeForm";
import { cn } from "~/lib/utils";

export default async function Home() {
  const session = await getServerAuthSession();
  const hasNameAndSurname = session?.user.firstName && session?.user.lastName;

  return (
    <main className="flex min-h-screen items-center justify-center text-primary">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-5xl">Hladstat</h1>
        {session ? (
          <div className="flex flex-col items-center gap-6">
            {!hasNameAndSurname ? (
              <>
                <p className="leading-none">
                  Aby kontynuować, podaj swoję imię i nazwisko.
                </p>
                <WelcomeForm />
              </>
            ) : (
              <>
                <p className="leading-none">
                  Zalogowano jako: {session.user.firstName}{" "}
                  {session.user.lastName}
                </p>
                <Link href="/dashboard" className={cn(buttonVariants())}>
                  Przejdź do aplikacji
                </Link>
              </>
            )}
          </div>
        ) : (
          <Login />
        )}
      </div>
    </main>
  );
}
