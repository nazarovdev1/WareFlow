import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow login page and register API without auth
        if (pathname === "/login" || pathname.startsWith("/api/register")) {
          return true;
        }
        
        // Allow public assets
        if (
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/_next/static") ||
          pathname.startsWith("/_next/image") ||
          pathname === "/favicon.ico"
        ) {
          return true;
        }
        
        // Require auth for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api/setup-admin|_next/static|_next/image|favicon.ico).*)"],
};
