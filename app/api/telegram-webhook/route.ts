import { type NextRequest, NextResponse } from "next/server";
import { sendNewsAlert, sendDailyNewsDigest } from "@/lib/telegram-news";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;

      // Handle news-related commands
      if (text === "/news") {
        // Fetch latest news and send top 3 articles
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/news?limit=3`,
        );
        const { articles } = await response.json();

        if (articles.length > 0) {
          for (const article of articles) {
            await sendNewsAlert({ chatId, article });
          }
        } else {
          // Send fallback message
          await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "📰 No recent news available. Check back later!",
              }),
            },
          );
        }
      }

      if (text === "/digest") {
        // Send daily digest
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/news?limit=5`,
        );
        const { articles } = await response.json();

        await sendDailyNewsDigest(chatId, articles);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
