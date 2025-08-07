import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb } from "@/lib/mongo-client"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection("users")

    const user = await users.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ verified: false, error: "Invalid or expired token" }, { status: 400 })
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: { isEmailVerified: true, updatedAt: new Date() },
        $unset: { verificationToken: "", verificationTokenExpiresAt: "" },
      }
    )

    // Clear pending email cookie if it matches
    const cookieEmail = cookies().get("pending_verification_email")?.value
    if (cookieEmail && cookieEmail === user.email) {
      cookies().set("pending_verification_email", "", { maxAge: 0, path: "/" })
    }

    return NextResponse.json({ verified: true })
  } catch (err) {
    console.error("Verify email error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
