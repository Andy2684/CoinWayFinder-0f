import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AccessControl } from "./lib/access-control"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require premium access
  const premiumRoutes = ["/bots", "/integrations", "/advanced-analytics"]

  if (premiumRoutes.some((route) => pathname.startsWith(route))) {
    // Get user ID from session (implement based on your auth system)
    const userId = request.headers.get("x-user-id") // You'll need to set this in your auth system

    if (userId) {
      try {
        const access = await AccessControl.checkUserAccess(userId)

        if (!access.hasAccess) {
          // Redirect to subscription page
          return NextResponse.redirect(new URL("/subscription?required=true", request.url))
        }
      } catch (error) {
        console.error("Middleware access check failed:", error)
        return NextResponse.redirect(new URL("/subscription?error=true", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/bots/:path*", "/integrations/:path*", "/advanced-analytics/:path*"],
}
