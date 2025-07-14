import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export async function GET(request: Request) {
  console.log("→ [Cohort] start handler")

  // --- Авторизация JWT ---
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }
  const token = authHeader.slice(7)
  let payload: any
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    )
  }
  if (payload.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 }
    )
  }
  console.log("→ [Cohort] auth OK, user role:", payload.role)
  // -------------------------------------------

  try {
    console.log("→ [Cohort] about to run DB query")

    const rows = await db
      .select({
        month: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`)

    console.log("→ [Cohort] DB returned rows:", rows)

    const data = rows.map(r => ({
      month: r.month,
      count: Number(r.count),
    }))

    console.log("→ [Cohort] mapped data:", data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("→ [Cohort] ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch cohort analysis" },
      { status: 500 }
    )
  }
}
