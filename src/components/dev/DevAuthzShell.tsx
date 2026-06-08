"use client";

import { type ReactNode } from "react";

import DevAuthzProvider from "./DevAuthzProvider";
import DevAuthzSwitcher from "./DevAuthzSwitcher";

export default function DevAuthzShell({ children }: { children: ReactNode }) {
  return (
    <DevAuthzProvider>
      {children}
      <DevAuthzSwitcher />
    </DevAuthzProvider>
  );
}
