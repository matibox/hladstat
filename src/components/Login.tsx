"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xl">Zaloguj się</span>
      <Button variant="outline" onClick={() => void signIn("discord")}>
        <Image
          src="/Discord.svg"
          alt="Discord logo"
          className="mr-2"
          width={22}
          height={16}
        />
        <span>Discord</span>
      </Button>
    </div>
  );
}
