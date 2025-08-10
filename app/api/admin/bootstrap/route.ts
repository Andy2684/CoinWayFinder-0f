import { NextResponse, type NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Ensure this route never gets statically executed
export const dynamic = "force-dynamic"
export const revalidate = 0

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401, headers: { "cache-control": "no-store" } })
}

function badRequest(message = "Bad Request") {
  return NextResponse.json({ error: message }, { status: 400, headers: { "cache-control": "no-store" } })
}

function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403, headers: { "cache-control": "no-store" } })
}

function notFound(message = "Not Found") {
  return NextResponse.json({ error: message }, { status: 404, headers: { "cache-control": "no-store" } })
}

export async function POST(req: NextRequest) {
  try {
    // 1) Authenticate request with a bootstrap token from env
    const authHeader = req.headers.get("authorization") || ""
    const isBearer = authHeader.toLowerCase().startsWith("bearer ")
    const token = isBearer ? authHeader.slice(7) : ""

    const bootstrapToken =
      process.env.ADMIN_BOOTSTRAP_TOKEN || process.env.STACK_SECRET_SERVER_KEY || process.env.JWT_SECRET

    if (!bootstrapToken) {
      return forbidden(
        "Bootstrap token is not configured. Set ADMIN_BOOTSTRAP_TOKEN (preferred) or STACK_SECRET_SERVER_KEY.",
      )
    }
    if (!token || token !== bootstrapToken) {
      return unauthorized("Invalid or missing bootstrap token")
    }

    // 2) Parse and validate body
    const body = await req.json().catch(() => ({}))
    const email: string | undefined = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined

    if (!email) {
      return badRequest('email is required in JSON body, e.g. { "email": "admin@example.com" }')
    }

    // 3) Promote existing user to admin (no password exchange)
    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const existing = await users.findOne({ email })
    if (!existing) {
      return notFound("User not found. Ask the user to complete sign-up first, then re-run this bootstrap request.")
    }

    // If already admin, respond idempotently
    if (existing.role === "admin") {
      return NextResponse.json(
        {
          success: true,
          message: "User is already an admin",
          user: { id: existing._id?.toString?.(), email: existing.email, role: existing.role },
        },
        { headers: { "cache-control": "no-store" } },
      )
    }

    const update = await users.findOneAndUpdate(
      { email },
      {
        $set: {
          role: "admin",
          isEmailVerified: true,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!update.value) {
      return NextResponse.json(
        { error: "Failed to promote user to admin" },
        { status: 500, headers: { "cache-control": "no-store" } },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "User promoted to admin",
        user: {
          id: update.value._id?.toString?.(),
          email: update.value.email,
          role: update.value.role,
        },
      },
      { headers: { "cache-control": "no-store" } },
    )
  } catch (err) {
    console.error("Admin bootstrap error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "cache-control": "no-store" } },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { allow: "POST", "cache-control": "no-store" } },
  )
}
