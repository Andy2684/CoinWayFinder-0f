import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { errors, message, stack, context, severity, userId } = body

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error report received:", body)
    }

    // In production, you would send this to your error tracking service
    // For now, we'll just log it
    if (errors) {
      // Multiple errors
      errors.forEach((error: any) => {
        console.error(`[${error.severity?.toUpperCase() || "ERROR"}]`, error.message, error.stack)
      })
    } else {
      // Single error
      console.error(`[${severity?.toUpperCase() || "ERROR"}]`, message, stack)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to process error report:", error)
    return NextResponse.json({ error: "Failed to process error report" }, { status: 500 })
  }
}
