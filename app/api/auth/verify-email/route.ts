import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ verificationToken: token })
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 })
    }

    const expiresAt = user.verificationTokenExpiresAt
    if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "Token has expired" }, { status: 400 })
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: { isEmailVerified: true, updated_at: new Date() },
        $unset: { verificationToken: "", verificationTokenExpiresAt: "" },
      }
    )

    const res = NextResponse.json({ success: true, message: "Email verified successfully" })
    res.cookies.set("pending_verification_email", "", { httpOnly: true, sameSite: "lax", path: "/", secure: true, maxAge: 0 })
    return res
  } catch (error) {
    console.error("Verify email error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
