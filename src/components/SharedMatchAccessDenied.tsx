import { HomeIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "~/components/ui/button";

export default function SharedMatchAccessDenied({
  title = "Przepraszamy, ten mecz nie jest udostępniony.",
  description = "Uważasz, że to pomyłka? Skontaktuj się z członkiem drużyny, który udostępnił tobie tego linka.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold leading-none md:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        <span>Strona główna</span>
        <HomeIcon className="ml-1 h-4 w-4" />
      </Link>
    </main>
  );
}
