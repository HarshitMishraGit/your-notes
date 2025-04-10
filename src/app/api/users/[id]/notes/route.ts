import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/users/[id]/notes - Get a user's public notes
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get the user's public notes
    const notes = await prisma.note.findMany({
      where: {
        userId: id,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        contentType: true,
        isPublic: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ user, notes });
  } catch (error) {
    console.error("Error fetching user's notes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
