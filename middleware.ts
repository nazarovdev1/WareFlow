import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "ibox-fallback-secret-key-12345",
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes except login, api/auth, and public assets
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
