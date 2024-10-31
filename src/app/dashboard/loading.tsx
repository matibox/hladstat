import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 md:mx-auto md:w-full md:max-w-5xl">
      <section className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold">Drużyny</h1>
          <Button disabled>Nowa drużyna</Button>
        </div>
        <div className="grid w-full grid-cols-[repeat(auto-fill,_343px)] justify-center gap-4">
          {[...Array(2).keys()].map((key) => (
            <div
              key={key}
              className="relative flex w-full items-center gap-4 rounded-md p-4"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
