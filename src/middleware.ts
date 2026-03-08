import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/home(.*)"]);
const isPublicOnlyRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Logged in + visiting "/" → redirect to /home
  if (isPublicOnlyRoute(req) && userId) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Not logged in + visiting /home → redirect to /
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
