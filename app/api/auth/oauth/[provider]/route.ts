import { type NextRequest, NextResponse } from "next/server"
import { getOAuthProvider, generateState, buildAuthUrl } from "@/lib/oauth-providers"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params
    const oauthProvider = getOAuthProvider(provider)

    if (!oauthProvider) {
      return NextResponse.json({ error: "Invalid OAuth provider" }, { status: 400 })
    }

    if (!oauthProvider.clientId || !oauthProvider.clientSecret) {
      return NextResponse.json({ error: "OAuth provider not configured" }, { status: 500 })
    }

    const state = generateState()
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/${provider}`
    const authUrl = buildAuthUrl(oauthProvider, state, redirectUri)

    const response = NextResponse.redirect(authUrl)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("OAuth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
