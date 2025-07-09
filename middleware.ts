import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./lib/auth"
import { AdminService } from "./lib/admin"

// Define protected routes
const protectedRoutes = ["/dashboard", "/bots", "/integrations", "/profile", "/subscription"]

const adminRoutes = ["/admin"]

const apiRoutes = ["/api/auth", "/api/user", "/api/bots", "/api/portfolio", "/api/trades"]

const publicApiRoutes = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/crypto/prices",
  "/api/crypto/news",
  "/api/stripe/webhook",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/api-docs'
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    try {
      const admin = await AdminService.getCurrentAdmin()
      if (!admin) {
        return NextResponse.redirect(new URL('/?admin=login', request.url))
      }
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/?admin=login', request.url))
    }
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) {
        return NextResponse.redirect(new URL('/?login=required', request.url))
      }
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/?login=required', request.url))
    }
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
// Allow public API routes
