import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "~/server/uploadthing";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Hladstat",
  description: "Hladstat to aplikacja do śledzenia statystyk siatkarskich.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const DevAuthzShell =
    process.env.NODE_ENV === "development"
      ? (await import("~/components/dev/DevAuthzShell")).default
      : null;

  const pageContent = <TooltipProvider>{children}</TooltipProvider>;

  return (
    <html lang="pl">
      <body
        className={cn(
          "dark min-h-screen bg-background antialiased",
          fontSans.className,
        )}
      >
        <TRPCReactProvider>
          <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
          {DevAuthzShell ? (
            <DevAuthzShell>{pageContent}</DevAuthzShell>
          ) : (
            pageContent
          )}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
