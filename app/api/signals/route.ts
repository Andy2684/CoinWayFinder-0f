import { type NextRequest, NextResponse } from "next/server"
import { getTradingSignals } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // 👉 Если getTradingSignals ожидает объект — используем так:
    const signals = await getTradingSignals({ limit, offset })

    return NextResponse.json({
      success: true,
      signals
    })
  } catch (error) {
    console.error("Signals fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
