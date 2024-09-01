import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "~/server/uploadthing";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "Hladstat",
  description: "Hladstat to aplikacja do śledzenia statystyk siatkarskich.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
