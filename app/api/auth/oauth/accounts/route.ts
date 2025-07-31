import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserOAuthAccounts, unlinkOAuthAccount } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const oauthAccounts = await getUserOAuthAccounts(decoded.userId)

    return NextResponse.json({
      success: true,
      accounts: oauthAccounts,
    })
  } catch (error) {
    console.error("Get OAuth accounts error:", error)
    return NextResponse.json({ error: "Failed to get OAuth accounts" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }

    const success = await unlinkOAuthAccount(decoded.userId, provider)

    if (!success) {
      return NextResponse.json({ error: "Failed to unlink account" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "OAuth account unlinked successfully",
    })
  } catch (error) {
    console.error("Unlink OAuth account error:", error)
    return NextResponse.json({ error: "Failed to unlink OAuth account" }, { status: 500 })
  }
}
