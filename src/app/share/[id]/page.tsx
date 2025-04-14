"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Comments } from "@/components/Comments";

type SharedNote = {
  id: string;
  title: string;
  content: string;
  contentType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  tags: string[];
};

export default function SharedNote() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<SharedNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/notes/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Note not found");
            return;
          }
          if (response.status === 403) {
            setError("This note is not shared publicly");
            return;
          }
          throw new Error("Failed to fetch note");
        }

        const data = await response.json();
        setNote(data);
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("An error occurred while fetching the note");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchNote();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {error || "Note not found"}
          </h1>
          <p className="mb-6 text-neutral-400">
            The note you're looking for doesn't exist or is not shared publicly.
          </p>
          <Link href="/">
            <Button className="bg-violet-600 hover:bg-violet-700">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between">
          <Link href="/">
            <Button
              variant="outline"
              className="bg-transparent text-white border-neutral-800 hover:bg-neutral-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden max-w-none">
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-white mb-2">
                {note.title}
              </h1>
              <div className="flex items-center space-x-1 text-neutral-400">
                <span>
                  Last updated:{" "}
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <Link
                  href={`/users/${note.user.id}`}
                  className="flex items-center text-violet-400 hover:text-violet-300"
                >
                  <User className="h-3 w-3 mr-1" />
                  {note.user.name}
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 my-4">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-violet-900/30 text-violet-300 border border-violet-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 border-t border-neutral-800 pt-6">
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </article>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-800">
              <Comments noteId={params.id as string} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
