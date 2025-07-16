import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserAlerts, createAlert } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const alerts = await getUserAlerts(decoded.userId)

    return NextResponse.json({
      success: true,
      alerts,
    })
  } catch (error) {
    console.error("Alerts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { name, symbol, condition, targetPrice } = await request.json()

    if (!name || !symbol || !condition || !targetPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const alert = await createAlert({
      userId: decoded.userId,
      name,
      symbol,
      condition,
      targetPrice: Number.parseFloat(targetPrice),
    })

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    console.error("Alert creation error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}
