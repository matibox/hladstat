import { HomeIcon } from "lucide-react";
import Link from "next/link";
import TeamContextProvider from "~/components/TeamContext";
import { buttonVariants } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function SharedMatchLayout({
  children,
  params: { matchId },
}: {
  children: React.ReactNode;
  params: { matchId: string };
}) {
  const match = await api.match.byId({ matchId: parseInt(matchId) });

  if (!match.shared) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold leading-none md:text-3xl">
            Przepraszamy, ten mecz nie jest udostępniony.
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Uważasz, że to pomyłka? Skontaktuj się z członkiem drużyny, który
            udostępnił tobie tego linka.
          </p>
        </div>
        <Link href="/" className={buttonVariants()}>
          <span>Strona główna</span>
          <HomeIcon className="ml-1 h-4 w-4" />
        </Link>
      </main>
    );
  }

  return (
    <TeamContextProvider isShared={true} teamId={match.teamId!}>
      {children}
    </TeamContextProvider>
  );
}
