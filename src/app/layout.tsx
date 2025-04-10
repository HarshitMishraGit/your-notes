import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { Providers } from "@/components/providers/session-provider";
import UserDropdown from "@/components/UserDropdown";

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-black text-white">
            {session && (
              <header className="border-b border-neutral-800 py-2 px-4">
                <div className="flex justify-between items-center">
                <div className="w-10"></div>
               
                  <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Notes App
                  </h1>
                  <UserDropdown />
                </div>
              </header>
            )}
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
