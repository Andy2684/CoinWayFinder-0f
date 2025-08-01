import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from authentication
    const userId = request.nextUrl.searchParams.get("userId") || "demo-user"

    const db = await connectToDatabase()

    const userAchievements = await db.collection("user_achievements").find({ userId }).toArray()

    return NextResponse.json(userAchievements)
  } catch (error) {
    console.error("Failed to fetch user achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
