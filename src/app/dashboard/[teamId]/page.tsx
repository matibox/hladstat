import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Team({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");

  return <div>{teamId}</div>;
}
