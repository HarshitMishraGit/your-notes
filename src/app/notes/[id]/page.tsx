"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";

// Import MD Editor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated" && params.id) {
      fetchNote(params.id as string);
    }
  }, [status, params.id, router]);

  const fetchNote = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/notes");
          return;
        }
        throw new Error("Failed to fetch note");
      }

      const data = await response.json();
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setIsPublic(data.isPublic);
      setTags(data.tags.join(", "));
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const response = await fetch(`/api/notes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          isPublic,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update note");
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating note:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      router.push("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Note not found</h1>
        <Button
          onClick={() => router.push("/")}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {isEditing ? (
            <h1 className="text-2xl font-bold text-white">Edit Note</h1>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{note.title}</h1>
              {note.isPublic && (
                <span className="text-xs px-2 py-1 rounded-full bg-violet-900/30 text-violet-300">
                  Public
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="grid gap-4 mb-6">
            <div>
              <Label htmlFor="title" className="text-neutral-200">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="bg-neutral-900 border-neutral-800 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="text-neutral-200">
                Tags (comma separated)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, ideas, todo"
                className="bg-neutral-900 border-neutral-800 text-white mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="public" className="text-neutral-200">
                Make note public
              </Label>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-neutral-400 text-sm">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {isEditing ? (
        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            height={500}
            preview="edit"
          />
        </div>
      ) : (
        <div className="prose prose-invert max-w-none bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
