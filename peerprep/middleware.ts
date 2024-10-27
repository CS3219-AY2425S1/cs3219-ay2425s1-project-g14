import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

function isNoSession(request: NextRequest): boolean {
  return (
    request.nextUrl.pathname.startsWith("/auth") && cookies().has("session")
  );
}

function isSession(request: NextRequest): boolean {
  return (
    !request.nextUrl.pathname.startsWith("/auth") && !cookies().has("session")
  );
}

export function middleware(request: NextRequest) {
  // UNCOMMENT AND ADD TO ENV IF JUST TESTING FRONTEND STUFF
  if (process.env.NEXT_BYPASS_LOGIN === "yesplease") {
    return NextResponse.next();
  }

  if (isNoSession(request)) {
    return NextResponse.redirect(new URL("/questions", request.url));
  }

  if (isSession(request)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// taken from Next.JS's Middleware tutorial
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
