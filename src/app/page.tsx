"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Note = {
  id: string;
  title: string;
  content: string;
  contentType: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Fetch notes if authenticated
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status, router]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">My Notes</h1>
        <Button
          onClick={() => router.push("/notes/new")}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-10">
          <div className="bg-neutral-900 rounded-full p-4 inline-block mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            No notes yet
          </h3>
          <p className="text-neutral-400 mb-6">
            Create your first note to get started
          </p>
          <Button
            onClick={() => router.push("/notes/new")}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Create a Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="h-full bg-neutral-900 border-neutral-800 hover:border-violet-500 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-white truncate">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-neutral-300">
                  <div className="line-clamp-3 prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>
                      {note.content.substring(0, 150)}
                    </ReactMarkdown>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    {note.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-300">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                  {note.isPublic && (
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-900/30 text-violet-300">
                      Public
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
