"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default function SharedNotePage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchNote(params.id as string);
    }
  }, [params.id]);

  const fetchNote = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Note not found");
          return;
        }
        if (response.status === 403) {
          setError("This note is private");
          return;
        }
        throw new Error("Failed to fetch note");
      }

      const data = await response.json();

      // Verify the note is public
      if (!data.isPublic) {
        setError("This note is private");
        return;
      }

      setNote(data);
    } catch (error) {
      console.error("Error fetching note:", error);
      setError("An error occurred while fetching the note");
    } finally {
      setIsLoading(false);
    }
  };

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
            The note you're looking for may be private or doesn't exist.
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              className="bg-transparent text-white border-neutral-800 hover:bg-neutral-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{note.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-neutral-800 text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-neutral-400">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="prose prose-invert max-w-none bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
