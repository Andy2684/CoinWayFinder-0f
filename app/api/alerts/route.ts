import { type NextRequest, NextResponse } from "next/server"
import { priceAlertManager } from "@/lib/price-alerts"

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json()

    // Validate required fields
    if (!alertData.userId || !alertData.symbol || !alertData.type || !alertData.condition) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create alert
    const alertId = priceAlertManager.createAlert({
      userId: alertData.userId,
      symbol: alertData.symbol.toUpperCase(),
      exchange: alertData.exchange || "binance",
      type: alertData.type,
      condition: alertData.condition,
      isActive: alertData.isActive !== false,
      message: alertData.message || `Alert for ${alertData.symbol}`,
      notificationMethods: alertData.notificationMethods || ["email"],
      metadata: alertData.metadata,
    })

    return NextResponse.json({
      success: true,
      alertId,
      message: "Alert created successfully",
    })
  } catch (error) {
    console.error("Alert creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const alertId = searchParams.get("alertId")
    const symbol = searchParams.get("symbol")
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = priceAlertManager.getAlertStats()
        return NextResponse.json({ success: true, data: stats })

      case "user":
        if (!userId) {
          return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }
        const userAlerts = priceAlertManager.getUserAlerts(userId)
        return NextResponse.json({ success: true, data: userAlerts })

      case "symbol":
        if (!symbol) {
          return NextResponse.json({ success: false, error: "Missing symbol" }, { status: 400 })
        }
        const symbolAlerts = priceAlertManager.getSymbolAlerts(symbol.toUpperCase())
        return NextResponse.json({ success: true, data: symbolAlerts })

      case "get":
        if (!alertId) {
          return NextResponse.json({ success: false, error: "Missing alertId" }, { status: 400 })
        }
        const alert = priceAlertManager.getAlert(alertId)
        if (!alert) {
          return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: alert })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Alert GET API error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { alertId, ...updates } = await request.json()

    if (!alertId) {
      return NextResponse.json({ success: false, error: "Missing alertId" }, { status: 400 })
    }

    const success = priceAlertManager.updateAlert(alertId, updates)

    if (!success) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Alert updated successfully",
    })
  } catch (error) {
    console.error("Alert update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("alertId")

    if (!alertId) {
      return NextResponse.json({ success: false, error: "Missing alertId" }, { status: 400 })
    }

    const success = priceAlertManager.deleteAlert(alertId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    })
  } catch (error) {
    console.error("Alert deletion error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 })
  }
}
