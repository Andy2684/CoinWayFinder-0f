import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, fetchUserInfo } from "@/lib/oauth-auth"
import { createUser, getUserByEmail, linkOAuthAccount } from "@/lib/auth"
import { generateToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_cancelled`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_invalid`)
    }

    const storedState = request.cookies.get("oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_state_mismatch`)
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/${provider}`
    const accessToken = await exchangeCodeForToken(provider, code, redirectUri)

    if (!accessToken) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_token_failed`)
    }

    const userInfo = await fetchUserInfo(provider, accessToken)
    if (!userInfo) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_user_info_failed`)
    }

    // Check if user exists
    let user = await getUserByEmail(userInfo.email)

    if (user) {
      // Link OAuth account to existing user
      await linkOAuthAccount(user.id, provider, userInfo.id, userInfo)
    } else {
      // Create new user
      user = await createUser({
        email: userInfo.email,
        username: userInfo.username || userInfo.email.split("@")[0],
        profile: {
          firstName: userInfo.name?.split(" ")[0] || "",
          lastName: userInfo.name?.split(" ").slice(1).join(" ") || "",
          avatar: userInfo.avatar,
        },
        isEmailVerified: true, // OAuth emails are considered verified
        oauthAccounts: [
          {
            provider,
            providerId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.avatar,
          },
        ],
      })
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email })

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)
    response.cookies.set("auth-token", token, {
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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_callback_failed`)
  }
}
