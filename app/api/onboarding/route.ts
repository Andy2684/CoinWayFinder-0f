import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectToDatabase()
    const onboarding = await db.collection("user_onboarding").findOne({ userId: decoded.userId })

    if (!onboarding) {
      // Create default onboarding record
      const defaultOnboarding = {
        userId: decoded.userId,
        currentStep: 0,
        completedSteps: [],
        profile: {
          firstName: "",
          lastName: "",
        },
        tradingExperience: {
          level: "beginner",
          yearsExperience: 0,
          previousPlatforms: [],
          tradingGoals: [],
          riskTolerance: "medium",
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: "dark",
          language: "en",
          timezone: "UTC",
        },
        exchanges: {
          connectedExchanges: [],
          apiKeys: [],
        },
        verification: {
          emailVerified: false,
          phoneVerified: false,
          identityVerified: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("user_onboarding").insertOne(defaultOnboarding)
      return NextResponse.json(defaultOnboarding)
    }

    return NextResponse.json(onboarding)
  } catch (error) {
    console.error("Get onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    const db = await connectToDatabase()

    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    if (step !== undefined) {
      updateData.currentStep = step
    }

    const result = await db
      .collection("user_onboarding")
      .findOneAndUpdate({ userId: decoded.userId }, { $set: updateData }, { returnDocument: "after", upsert: true })

    return NextResponse.json(result.value)
  } catch (error) {
    console.error("Update onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
