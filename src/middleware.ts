import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  ignoredRoutes: ["/api/inngest", "/x/inngest"],
  publicRoutes: ["/api/inngest", "/x/inngest"],
  afterAuth: async (auth, req, res) => {
    if (auth.orgId) return;

    console.log(auth);

    if (!auth.userId && !auth.isPublicRoute)
      return redirectToSignIn({ returnBackUrl: req.url });

    if (req.nextUrl.pathname !== "/org-selection")
      return NextResponse.redirect(new URL("/org-selection", req.url));
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
