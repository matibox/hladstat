import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) redirect("/");

  return <div>dashboard</div>;
}
