import { type NextRequest, NextResponse } from "next/server"
import { getOAuthProvider } from "@/lib/oauth-providers"
import { exchangeCodeForToken, fetchOAuthUser, findOrCreateOAuthUser, createOAuthSession } from "@/lib/oauth-auth"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for OAuth errors
    if (error) {
      const errorDescription = searchParams.get("error_description") || "OAuth authentication failed"
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=${encodeURIComponent(errorDescription)}`,
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=Missing authorization code or state`,
      )
    }

    // Verify state parameter
    const storedState = request.cookies.get("oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=Invalid state parameter`)
    }

    const oauthProvider = getOAuthProvider(provider)
    if (!oauthProvider) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=Invalid OAuth provider`)
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(oauthProvider, code)

    // Fetch user information
    const oauthUser = await fetchOAuthUser(oauthProvider, accessToken)

    // Find or create user in database
    const user = await findOrCreateOAuthUser(oauthUser)

    // Create session
    const session = await createOAuthSession(user)

    // Set auth cookie and redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)

    response.cookies.set("auth_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Clear OAuth state cookie
    response.cookies.delete("oauth_state")

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`,
    )
  }
}
