import { type NextRequest, NextResponse } from "next/server";
import { aiBotManager, type AIBotConfig } from "@/lib/ai-bot-strategies";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const config: AIBotConfig = await request.json();

    // Validate the configuration
    if (!config.strategyId || !config.name || !config.investment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (config.investment < 100) {
      return NextResponse.json(
        { error: "Minimum investment is $100" },
        { status: 400 },
      );
    }

    // Create the bot
    const botId = aiBotManager.createBot(config);

    // Send confirmation email if notifications are enabled
    if (config.notifications.email) {
      const userEmail = "project.command.center@gmail.com"; // In real app, get from session/auth
      await emailService.sendBotCreationEmail(userEmail, config);
    }

    // Log bot creation for monitoring
    console.log(`AI Bot created: ${botId}`, {
      strategy: config.strategyId,
      investment: config.investment,
      aiOptimization: config.aiOptimization,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      botId,
      message: "AI bot created successfully",
      config: {
        name: config.name,
        strategy: config.strategyId,
        investment: config.investment,
        aiOptimization: config.aiOptimization,
      },
    });
  } catch (error) {
    console.error("Error creating AI bot:", error);
    return NextResponse.json(
      { error: "Failed to create AI bot" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const bots = aiBotManager.getAllBots();
    return NextResponse.json({ bots });
  } catch (error) {
    console.error("Error fetching AI bots:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI bots" },
      { status: 500 },
    );
  }
}
