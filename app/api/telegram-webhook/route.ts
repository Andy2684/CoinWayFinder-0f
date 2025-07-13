import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Handle Telegram webhook update
    if (update.message) {
      const { chat, text } = update.message

      // Simple command handling
      if (text === "/start") {
        // Send welcome message
        console.log(`Welcome message sent to chat ${chat.id}`)
      } else if (text === "/signals") {
        // Send latest signals
        console.log(`Signals sent to chat ${chat.id}`)
      } else if (text === "/portfolio") {
        // Send portfolio summary
        console.log(`Portfolio summary sent to chat ${chat.id}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
