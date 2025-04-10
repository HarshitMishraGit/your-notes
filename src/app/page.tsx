import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Notes App</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/notes"
            className="p-4 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">My Notes</h2>
            <p>View and manage your personal notes</p>
          </Link>
          <Link
            href="/notes/new"
            className="p-4 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Create Note</h2>
            <p>Create a new note</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
