import React from "react";

export default async function TeamLayout({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {nav}
      {children}
    </div>
  );
}
