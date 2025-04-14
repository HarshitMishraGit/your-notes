"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

// Import MD Editor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function NewNote() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "# New Note\n\nStart writing your note here..."
  );
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          contentType: "markdown",
          isPublic,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create note");
      }

      const note = await response.json();
      router.push(`/notes/${note.id}`);
    } catch (err) {
      console.error("Error creating note:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Create New Note
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300">
              {error}
            </div>
          )}

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

            <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-md bg-neutral-900/50">
              <div className="space-y-0.5">
                <Label htmlFor="public" className="text-base text-neutral-200">
                  Make note public
                </Label>
                <p className="text-sm text-neutral-400">
                  {isPublic
                    ? "Anyone with the link can view this note"
                    : "Only you can view this note"}
                </p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-neutral-700 h-6 w-11 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            height={500}
            preview="edit"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8"
          >
            {isSubmitting ? "Creating..." : "Create Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
