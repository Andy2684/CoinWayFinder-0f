import { type NextRequest, NextResponse } from "next/server"
import { getGoogleProvider, getGitHubProvider, generateOAuthUrl } from "@/lib/oauth-providers"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params

    if (!provider || !["google", "github"].includes(provider)) {
      return NextResponse.json({ error: "Invalid OAuth provider" }, { status: 400 })
    }

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    // Get provider configuration
    const providerConfig = provider === "google" ? getGoogleProvider() : getGitHubProvider()

    // Check if provider is configured
    if (!providerConfig.clientId || !providerConfig.clientSecret) {
      return NextResponse.json({ error: `${provider} OAuth is not configured` }, { status: 500 })
    }

    // Generate OAuth URL
    const authUrl = generateOAuthUrl(providerConfig, state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error(`OAuth ${params.provider} initiation error:`, error)
    return NextResponse.json({ error: "Failed to initiate OAuth flow" }, { status: 500 })
  }
}
