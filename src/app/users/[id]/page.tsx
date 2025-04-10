"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  name: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  contentType: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
};

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchUserData(params.id as string);
    }
  }, [params.id]);

  const fetchUserData = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/notes`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("User not found");
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const { user, notes } = await response.json();
      setUser(user);
      setNotes(notes);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("An error occurred while fetching user data");
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

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {error || "User not found"}
          </h1>
          <p className="mb-6 text-neutral-400">
            The user you're looking for doesn't exist.
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

        <div className="mb-8 flex items-center gap-4">
          <div className="bg-violet-600 text-white p-4 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-neutral-400">Public Notes</p>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-xl text-neutral-400">No public notes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {notes.map((note) => (
              <Link key={note.id} href={`/share/${note.id}`}>
                <Card className="bg-neutral-900 border-neutral-800 hover:border-violet-500 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white">
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
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
