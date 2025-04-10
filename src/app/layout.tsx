import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { Providers } from "@/components/providers/session-provider";
import UserDropdown from "@/components/UserDropdown";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notes App",
  description: "A simple notes app built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-neutral-950 text-white min-h-screen`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <header className="border-b border-neutral-800 py-4">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <Link
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  Notes App
                </Link>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  {session && <UserDropdown />}
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
