import { type NextRequest, NextResponse } from "next/server"
import { eq, and, inArray, desc } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { signals } from "@/lib/db/schema"
import { insertSignalSchema } from "@/lib/db/schema"

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")?.split(",") || []
    const strategies = searchParams.get("strategies")?.split(",") || []
    const exchanges = searchParams.get("exchanges")?.split(",") || []
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query conditions
    const conditions = [eq(signals.userId, userId)]

    if (symbols.length > 0) {
      conditions.push(inArray(signals.symbol, symbols))
    }

    if (strategies.length > 0) {
      conditions.push(inArray(signals.strategy, strategies))
    }

    if (exchanges.length > 0) {
      conditions.push(inArray(signals.exchange, exchanges))
    }

    if (status) {
      conditions.push(eq(signals.status, status))
    }

    // Execute query
    const userSignals = await db
      .select()
      .from(signals)
      .where(and(...conditions))
      .orderBy(desc(signals.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalCount = await db
      .select({ count: signals.id })
      .from(signals)
      .where(and(...conditions))

    return NextResponse.json({
      success: true,
      data: userSignals,
      total: totalCount.length,
    })
  } catch (error) {
    console.error("Error fetching signals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch signals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = insertSignalSchema.safeParse({
      ...body,
      userId,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      )
    }

    // Create new signal
    const newSignal = await db
      .insert(signals)
      .values({
        ...validationResult.data,
        currentPrice: validationResult.data.entryPrice,
        pnl: "0",
        pnlPercentage: "0",
        progress: 0,
        status: "ACTIVE",
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newSignal[0],
      message: "Signal created successfully",
    })
  } catch (error) {
    console.error("Error creating signal:", error)
    return NextResponse.json({ success: false, error: "Failed to create signal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Signal ID is required" }, { status: 400 })
    }

    // Update signal (only if it belongs to the user)
    const updatedSignal = await db
      .update(signals)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(signals.id, id), eq(signals.userId, userId)))
      .returning()

    if (!updatedSignal.length) {
      return NextResponse.json({ success: false, error: "Signal not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedSignal[0],
      message: "Signal updated successfully",
    })
  } catch (error) {
    console.error("Error updating signal:", error)
    return NextResponse.json({ success: false, error: "Failed to update signal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Signal ID is required" }, { status: 400 })
    }

    // Delete signal (only if it belongs to the user)
    const deletedSignal = await db
      .delete(signals)
      .where(and(eq(signals.id, id), eq(signals.userId, userId)))
      .returning()

    if (!deletedSignal.length) {
      return NextResponse.json({ success: false, error: "Signal not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Signal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting signal:", error)
    return NextResponse.json({ success: false, error: "Failed to delete signal" }, { status: 500 })
  }
}
