"use client";

import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, X, Tag, FileText, Type } from "lucide-react";
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

type SearchFilter = "all" | "title" | "content" | "tags";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("status", status);
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Fetch notes if authenticated
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (notes.length > 0) {
      filterNotes();
    }
  }, [searchQuery, searchFilter, notes]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter((note) => {
      switch (searchFilter) {
        case "title":
          return note.title.toLowerCase().includes(query);
        case "content":
          return note.content.toLowerCase().includes(query);
        case "tags":
          return note.tags.some((tag) => tag.toLowerCase().includes(query));
        case "all":
        default:
          return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query))
          );
      }
    });

    setFilteredNotes(filtered);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-violet-950">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Notes</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              {showSearch ? (
                <div className="flex items-center h-10 bg-neutral-900 rounded-lg border border-neutral-800 transition-all duration-700f">
                  <div className="flex items-center gap-1 pl-2 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs px-2 py-1 h-auto ${
                        searchFilter === "all"
                          ? "bg-violet-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                      onClick={() => setSearchFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs px-2 py-1 h-auto ${
                        searchFilter === "title"
                          ? "bg-violet-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                      onClick={() => setSearchFilter("title")}
                    >
                      <Type className="h-3 w-3 mr-1" />
                      Title
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs px-2 py-1 h-auto ${
                        searchFilter === "content"
                          ? "bg-violet-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                      onClick={() => setSearchFilter("content")}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Content
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs px-2 py-1 h-auto ${
                        searchFilter === "tags"
                          ? "bg-violet-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                      onClick={() => setSearchFilter("tags")}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      Tags
                    </Button>
                  </div>
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notes..."
                    className="h-9 w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 mx-1"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent h-10 w-10 text-white border-neutral-800 hover:bg-neutral-900 transition-all duration-200 ease-in-out animate-in fade-in"
                  onClick={() => setShowSearch(true)}
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={() => router.push("/notes/new")}
              className="bg-violet-600 hover:bg-violet-700 h-10"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
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
          <>
            {searchQuery && filteredNotes.length === 0 ? (
              <div className="text-center py-10 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <p className="text-xl text-neutral-400">
                  No matching notes found
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Try changing your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
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
          </>
        )}
      </div>
    </div>
  );
}
