import { type NextRequest, NextResponse } from "next/server";
import {
  PortfolioAggregator,
  ExchangeFactory,
} from "@/lib/exchange-integrations";

export async function POST(request: NextRequest) {
  try {
    const { exchanges } = await request.json();

    if (!exchanges || !Array.isArray(exchanges)) {
      return NextResponse.json(
        { success: false, error: "Invalid exchanges data" },
        { status: 400 },
      );
    }

    const aggregator = new PortfolioAggregator();

    // Add all connected exchanges
    for (const exchange of exchanges) {
      if (exchange.credentials && exchange.status === "active") {
        try {
          aggregator.addExchange(exchange.id, {
            apiKey: exchange.credentials.apiKey,
            secretKey: exchange.credentials.secretKey,
            passphrase: exchange.credentials.passphrase,
            testnet: exchange.isTestnet,
          });
        } catch (error) {
          console.error(`Failed to add ${exchange.id}:`, error);
        }
      }
    }

    // Get aggregated portfolio
    const portfolio = await aggregator.getAggregatedBalance();

    return NextResponse.json({
      success: true,
      data: {
        portfolio,
        timestamp: new Date().toISOString(),
        exchanges: exchanges.length,
      },
    });
  } catch (error) {
    console.error("Portfolio sync error:", error);
    return NextResponse.json(
      { success: false, error: "Portfolio sync failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    supportedExchanges: ExchangeFactory.getSupportedExchanges(),
    message: "Portfolio sync endpoint ready",
  });
}
