import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentsProps {
  noteId: string;
  className?: string;
}

export function Comments({ noteId, className }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchComments = async (pageNum: number) => {
    try {
      const response = await fetch(
        `/api/notes/${noteId}/comments?page=${pageNum}&limit=5`
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      return data;
    } catch (err) {
      setError("Failed to load comments");
      return null;
    }
  };

  const loadMoreComments = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const data = await fetchComments(page + 1);
    setIsLoadingMore(false);

    if (data) {
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    }
  }, [page, hasMore, isLoadingMore, noteId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreComments();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreComments, hasMore]);

  useEffect(() => {
    const loadInitialComments = async () => {
      setIsLoading(true);
      const data = await fetchComments(1);
      setIsLoading(false);

      if (data) {
        setComments(data.comments);
        setHasMore(data.hasMore);
        setTotalComments(data.total);
      }
    };

    loadInitialComments();
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setNewComment("");
    } catch (err) {
      setError("Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/notes/${noteId}/comments?commentId=${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setTotalComments((prev) => prev - 1);
    } catch (err) {
      setError("Failed to delete comment");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-200">Comments</h3>
        <span className="text-sm text-neutral-400">
          {totalComments} {totalComments === 1 ? "comment" : "comments"}
        </span>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewComment(e.target.value)
            }
            placeholder="Write a comment..."
            className="min-h-[80px] bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-neutral-400">
          Please sign in to post comments.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 p-3 rounded-lg bg-neutral-950/50 border border-neutral-800"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.image || undefined} />
              <AvatarFallback>
                {comment.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-200">
                    {comment.user.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {session?.user?.email &&
                  comment.user.id === session.user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500 hover:text-red-500"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
              <p className="text-sm text-neutral-300">{comment.content}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator and observer target */}
        <div ref={observerTarget} className="h-4 w-full">
          {isLoadingMore && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
