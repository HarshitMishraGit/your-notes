import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get comments for a note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = params.id;

  try {
    console.log("Fetching comments for note:", noteId);
    const comments = await prisma.comment.findMany({
      where: { noteId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Found comments:", comments.length);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const noteId = params.id;
    const { content } = await request.json();
    console.log("Creating comment for note:", noteId, "by user:", user.id);

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if the note exists and if it's accessible to the user
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Allow comments if the note is public or if the user owns it
    if (!note.isPublic && note.userId !== user.id) {
      const sharedNote = await prisma.sharedNote.findFirst({
        where: {
          noteId,
          userId: user.id,
        },
      });

      if (!sharedNote) {
        return NextResponse.json(
          { error: "Not authorized to comment" },
          { status: 403 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        noteId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    console.log("Created comment:", comment.id);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const commentId = url.searchParams.get("commentId");
    console.log("Deleting comment:", commentId, "by user:", user.id);

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { note: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only allow deletion if the user is the comment author or the note owner
    if (comment.userId !== user.id && comment.note.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    console.log("Comment deleted successfully");
    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
