import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGoogleProvider, getGitHubProvider, exchangeCodeForToken, getUserInfo } from "@/lib/oauth-providers"
import { findOrCreateOAuthUser } from "@/lib/oauth-auth"
import { generateToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for OAuth errors
    if (error) {
      console.error(`OAuth ${provider} error:`, error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_error`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=missing_code`)
    }

    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get("oauth_state")?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=invalid_state`)
    }

    // Clear state cookie
    cookieStore.delete("oauth_state")

    // Get provider configuration
    const providerConfig = provider === "google" ? getGoogleProvider() : getGitHubProvider()

    if (!providerConfig.clientId || !providerConfig.clientSecret) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=provider_not_configured`)
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(providerConfig, code)

    if (!tokenData.access_token) {
      throw new Error("No access token received")
    }

    // Get user info from provider
    const userInfo = await getUserInfo(providerConfig, tokenData.access_token)

    // Handle different provider response formats
    let oauthUser
    if (provider === "google") {
      oauthUser = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar_url: userInfo.picture,
        provider: "google",
        provider_id: userInfo.id,
      }
    } else if (provider === "github") {
      // GitHub might not return email in user info, need to fetch separately
      let email = userInfo.email

      if (!email) {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/json",
            "User-Agent": "CoinWayFinder-App",
          },
        })

        if (emailResponse.ok) {
          const emails = await emailResponse.json()
          const primaryEmail = emails.find((e: any) => e.primary && e.verified)
          email = primaryEmail?.email || emails[0]?.email
        }
      }

      if (!email) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=no_email`)
      }

      oauthUser = {
        id: userInfo.id.toString(),
        email: email,
        name: userInfo.name || userInfo.login,
        avatar_url: userInfo.avatar_url,
        provider: "github",
        provider_id: userInfo.id.toString(),
      }
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // Find or create user in database
    const user = await findOrCreateOAuthUser(oauthUser)

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Set auth cookie
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)
  } catch (error) {
    console.error(`OAuth ${params.provider} callback error:`, error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_callback_failed`)
  }
}
