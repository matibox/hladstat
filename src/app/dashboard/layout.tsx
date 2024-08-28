import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  if (!session) redirect("/");

  return children;
}
