import { type NextRequest, NextResponse } from "next/server"
import { ACHIEVEMENTS } from "@/lib/achievement-definitions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const rarity = searchParams.get("rarity")
    const includeHidden = searchParams.get("includeHidden") === "true"

    let filteredAchievements = ACHIEVEMENTS

    if (category && category !== "all") {
      filteredAchievements = filteredAchievements.filter((a) => a.category === category)
    }

    if (rarity && rarity !== "all") {
      filteredAchievements = filteredAchievements.filter((a) => a.rarity === rarity)
    }

    if (!includeHidden) {
      filteredAchievements = filteredAchievements.filter((a) => !a.isHidden)
    }

    return NextResponse.json({
      success: true,
      achievements: filteredAchievements,
      total: filteredAchievements.length,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch achievements" }, { status: 500 })
  }
}
