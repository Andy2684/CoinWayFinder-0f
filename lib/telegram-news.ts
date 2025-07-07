// Telegram bot integration for news alerts

export interface TelegramNewsAlert {
  chatId: string
  article: {
    title: string
    summary: string
    source: string
    category: string
    sentiment: string
    aiSummary?: string
    url: string
  }
}

export async function sendNewsAlert({ chatId, article }: TelegramNewsAlert) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error("Telegram bot token not configured")
    return false
  }

  const sentimentEmoji = {
    positive: "🟢",
    negative: "🔴",
    neutral: "⚪",
  }

  const categoryEmoji = {
    crypto: "🪙",
    stocks: "📈",
    economy: "🏦",
  }

  const message = `
📰 *${article.title}*

${categoryEmoji[article.category as keyof typeof categoryEmoji]} *${article.category.toUpperCase()}* | ${sentimentEmoji[article.sentiment as keyof typeof sentimentEmoji]} ${article.sentiment.toUpperCase()}

📝 ${article.summary}

${article.aiSummary ? `🧠 *AI Analysis:* ${article.aiSummary}` : ""}

📊 *Source:* ${article.source}
🔗 [Read More](${article.url})
  `.trim()

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending Telegram news alert:", error)
    return false
  }
}

export async function sendDailyNewsDigest(chatId: string, topArticles: any[]) {
  const message = `
🌅 *Daily Market Digest*

Here are today's top market-moving stories:

${topArticles
  .map(
    (article, index) => `
${index + 1}. *${article.title}*
   ${article.category.toUpperCase()} | ${article.sentiment.toUpperCase()}
   ${article.aiSummary || article.summary}
`,
  )
  .join("\n")}

💡 *Trading Tip:* Stay informed but don't let news drive emotional decisions. Stick to your strategy!

Use /settings to customize your news preferences.
  `.trim()

  const botToken = process.env.TELEGRAM_BOT_TOKEN

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending daily digest:", error)
    return false
  }
}
