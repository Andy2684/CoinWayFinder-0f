import { type NextRequest, NextResponse } from "next/server"

// Mock orders storage
const mockOrders = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const symbol = searchParams.get("symbol")

    let orders = Array.from(mockOrders.values())

    if (status) {
      orders = orders.filter((order: any) => order.status === status)
    }

    if (symbol) {
      orders = orders.filter((order: any) => order.symbol === symbol)
    }

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    })
  } catch (error) {
    console.error("Error fetching paper trading orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, side, type, quantity, price, stopPrice, strategy } = body

    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
      strategy,
      status: type === "MARKET" ? "FILLED" : "PENDING",
      filledQuantity: type === "MARKET" ? quantity : 0,
      averagePrice: type === "MARKET" ? price || 43000 + Math.random() * 100 : undefined,
      timestamp: new Date().toISOString(),
    }

    mockOrders.set(order.id, order)

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order placed successfully",
    })
  } catch (error) {
    console.error("Error placing paper trading order:", error)
    return NextResponse.json({ success: false, error: "Failed to place order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const order = mockOrders.get(orderId)
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Cannot cancel non-pending order" }, { status: 400 })
    }

    order.status = "CANCELLED"
    mockOrders.set(orderId, order)

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling paper trading order:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel order" }, { status: 500 })
  }
}
