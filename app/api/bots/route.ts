import { type NextRequest, NextResponse } from "next/server"
import { eq, and, desc } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { bots } from "@/lib/db/schema"
import { insertBotSchema } from "@/lib/db/schema"

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
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query conditions
    const conditions = [eq(bots.userId, userId)]

    if (status) {
      conditions.push(eq(bots.status, status))
    }

    // Execute query
    const userBots = await db
      .select()
      .from(bots)
      .where(and(...conditions))
      .orderBy(desc(bots.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalCount = await db
      .select({ count: bots.id })
      .from(bots)
      .where(and(...conditions))

    return NextResponse.json({
      success: true,
      data: userBots,
      total: totalCount.length,
    })
  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 })
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
    const validationResult = insertBotSchema.safeParse({
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

    // Create new bot
    const newBot = await db
      .insert(bots)
      .values({
        ...validationResult.data,
        status: "INACTIVE",
        profit: "0",
        totalTrades: 0,
        winRate: "0",
        maxDrawdown: "0",
        sharpeRatio: "0",
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newBot[0],
      message: "Bot created successfully",
    })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ success: false, error: "Failed to create bot" }, { status: 500 })
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
      return NextResponse.json({ success: false, error: "Bot ID is required" }, { status: 400 })
    }

    // Update bot (only if it belongs to the user)
    const updatedBot = await db
      .update(bots)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(bots.id, id), eq(bots.userId, userId)))
      .returning()

    if (!updatedBot.length) {
      return NextResponse.json({ success: false, error: "Bot not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedBot[0],
      message: "Bot updated successfully",
    })
  } catch (error) {
    console.error("Error updating bot:", error)
    return NextResponse.json({ success: false, error: "Failed to update bot" }, { status: 500 })
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
      return NextResponse.json({ success: false, error: "Bot ID is required" }, { status: 400 })
    }

    // Delete bot (only if it belongs to the user)
    const deletedBot = await db
      .delete(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, userId)))
      .returning()

    if (!deletedBot.length) {
      return NextResponse.json({ success: false, error: "Bot not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Bot deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting bot:", error)
    return NextResponse.json({ success: false, error: "Failed to delete bot" }, { status: 500 })
  }
}
