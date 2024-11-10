import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/questions/*", "/user/*"];
const publicRoutes = ["/", "/auth/login/", "/auth/register"];

const isValidSession = () => {
  return cookies().has("session");
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // UNCOMMENT AND ADD TO ENV IF JUST TESTING FRONTEND STUFF
  if (process.env.NEXT_BYPASS_LOGIN === "yesplease") {
    return NextResponse.next();
  }

  if (!isValidSession() && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (path === "/auth/logout" || path === "/auth/logout/") {
    let response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};
