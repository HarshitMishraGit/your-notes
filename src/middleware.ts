import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
  "/share/",
  "/users/",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (publicPath) => path.startsWith(publicPath) || path === "/"
  );

  // For paths starting with /share/ or /users/, we need to allow unauthenticated access
  if (path.startsWith("/share/") || path.startsWith("/users/")) {
    return NextResponse.next();
  }

  // For API routes starting with /api/notes/
  if (path.startsWith("/api/notes/")) {
    // For GET requests to a specific note, we'll check the auth in the API route
    // This allows public notes to be accessed
    if (request.method === "GET") {
      return NextResponse.next();
    }
  }

  // For API routes to fetch user data
  if (path.startsWith("/api/users/") && request.method === "GET") {
    return NextResponse.next();
  }

  // For API routes that don't require authentication
  if (path.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirect unauthenticated users to login if trying to access protected routes
  if (!token && !isPublicPath) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    token &&
    (path.startsWith("/auth/signin") || path.startsWith("/auth/signup"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (Next.js internals)
     * - Static files (.png, .jpg, etc.)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|images|favicon.ico).*)",
  ],
};
