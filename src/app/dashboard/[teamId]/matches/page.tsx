import { HydrateClient } from "~/trpc/server";

export default function AllMatchesPage() {
  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-4 md:grid md:max-w-7xl md:grid-cols-2 md:px-6 md:pb-6 lg:gap-12 lg:px-8 lg:pb-8">
        wszystkie mecze
      </main>
    </HydrateClient>
  );
}
