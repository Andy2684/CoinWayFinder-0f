import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
    const isPublicPage = ["/", "/pricing", "/features", "/about"].includes(req.nextUrl.pathname)

    // Allow API auth routes
    if (isApiAuthRoute) {
      return NextResponse.next()
    }

    // Allow public pages
    if (isPublicPage) {
      return NextResponse.next()
    }

    // Redirect to home if accessing auth pages while authenticated
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Redirect to auth if accessing protected pages while not authenticated
    if (!isAuthPage && !isAuth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes and API routes
        const isPublicRoute = ["/", "/pricing", "/features", "/about"].includes(req.nextUrl.pathname)
        const isApiRoute = req.nextUrl.pathname.startsWith("/api")
        const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")

        if (isPublicRoute || isApiRoute || isAuthRoute) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
