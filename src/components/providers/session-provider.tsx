"use client";

import { SessionProvider } from "next-auth/react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
