import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { simpleHash, generateRandomString } from "./lib/security"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Example of using the browser-compatible replacements
  const randomString = generateRandomString(32)
  const hashedString = simpleHash(randomString)

  // You can perform other middleware logic here, such as authentication,
  // redirection, or setting headers.

  // For example, to redirect to a different page:
  // return NextResponse.redirect(new URL('/new-page', request.url))

  // Or to set a header:
  const response = NextResponse.next()
  response.headers.set("x-middleware-custom", "value")

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/about/:path*",
}
