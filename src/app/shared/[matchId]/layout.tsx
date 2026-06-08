import { redirect } from "next/navigation";
import TeamContextProvider from "~/components/TeamContext";
import SharedMatchAccessDenied from "~/components/SharedMatchAccessDenied";
import { getServerAuthSession } from "~/server/auth";
import { getTrpcErrorCode } from "~/lib/trpc-error";
import { api } from "~/trpc/server";

export default async function SharedMatchLayout({
  children,
  params: { matchId },
}: {
  children: React.ReactNode;
  params: { matchId: string };
}) {
  const parsedMatchId = parseInt(matchId);

  let match;
  try {
    match = await api.match.byId({ matchId: parsedMatchId });
  } catch (error) {
    const code = getTrpcErrorCode(error);

    if (code === "FORBIDDEN") {
      return <SharedMatchAccessDenied />;
    }

    if (code === "NOT_FOUND") {
      return (
        <SharedMatchAccessDenied
          title="Nie znaleziono meczu."
          description="Sprawdź link lub skontaktuj się z osobą, która go udostępniła."
        />
      );
    }

    throw error;
  }

  if (!match.shared) {
    return <SharedMatchAccessDenied />;
  }

  const session = await getServerAuthSession();
  if (session?.user) {
    const { isInTeam } = await api.user.isInTeam({ teamId: match.teamId });
    if (isInTeam) return redirect(`/dashboard/${match.teamId}/${matchId}`);
  }

  return (
    <TeamContextProvider isShared={true} teamId={match.teamId}>
      {children}
    </TeamContextProvider>
  );
}
