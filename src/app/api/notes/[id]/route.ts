import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/notes/[id] - Get a specific note
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const id = params.id;

    // First check if the note exists
    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        contentType: true,
        isPublic: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    // If the note is public, anyone can access it
    if (note.isPublic) {
      // Remove userId for privacy
      const { userId, ...publicNote } = note;
      return NextResponse.json(publicNote);
    }

    // If the note is private, check authentication
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the note belongs to the user
    if (note.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const id = params.id;

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the note
    const note = await prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    // Check if the note belongs to the user
    if (note.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { title, content, contentType, isPublic, tags } =
      await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        contentType: contentType || "markdown",
        isPublic: isPublic || false,
        tags: tags || [],
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const id = params.id;

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the note
    const note = await prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    // Check if the note belongs to the user
    if (note.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Delete any images associated with the note first
    await prisma.image.deleteMany({
      where: { noteId: id },
    });

    // Then delete the note
    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
