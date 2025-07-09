import { type NextRequest, NextResponse } from "next/server"

interface WhaleTransaction {
  id: string
  amount: number
  amountUsd: number
  symbol: string
  from: string
  to: string
  hash: string
  timestamp: string
  type: "transfer" | "exchange_deposit" | "exchange_withdrawal"
  exchange?: string
}

// Mock whale data
const mockWhaleData: WhaleTransaction[] = [
  {
    id: "1",
    amount: 1500,
    amountUsd: 97500000,
    symbol: "BTC",
    from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    to: "Binance",
    hash: "0x1234...5678",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: "exchange_deposit",
    exchange: "Binance",
  },
  {
    id: "2",
    amount: 50000,
    amountUsd: 125000000,
    symbol: "ETH",
    from: "Coinbase",
    to: "0x742d35Cc6634C0532925a3b8D4C9db96590b4",
    hash: "0xabcd...efgh",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "exchange_withdrawal",
    exchange: "Coinbase",
  },
  {
    id: "3",
    amount: 2000,
    amountUsd: 130000000,
    symbol: "BTC",
    from: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    to: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    hash: "0x9876...5432",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: "transfer",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const minAmount = Number.parseInt(searchParams.get("min_amount") || "1000000") // $1M minimum

    let whaleData = mockWhaleData

    // Try Whale Alert API if available
    if (process.env.WHALE_ALERT_API_KEY) {
      try {
        const response = await fetch(
          `https://api.whale-alert.io/v1/transactions?api_key=${process.env.WHALE_ALERT_API_KEY}&min_value=${minAmount}&limit=${limit}`,
        )

        if (response.ok) {
          const data = await response.json()
          whaleData =
            data.transactions?.map((tx: any) => ({
              id: tx.hash,
              amount: tx.amount,
              amountUsd: tx.amount_usd,
              symbol: tx.symbol,
              from: tx.from.address || tx.from.owner || "Unknown",
              to: tx.to.address || tx.to.owner || "Unknown",
              hash: tx.hash,
              timestamp: new Date(tx.timestamp * 1000).toISOString(),
              type:
                tx.from.owner_type === "exchange"
                  ? "exchange_withdrawal"
                  : tx.to.owner_type === "exchange"
                    ? "exchange_deposit"
                    : "transfer",
              exchange:
                tx.from.owner_type === "exchange"
                  ? tx.from.owner
                  : tx.to.owner_type === "exchange"
                    ? tx.to.owner
                    : undefined,
            })) || mockWhaleData
        }
      } catch (apiError) {
        console.error("Whale Alert API error:", apiError)
        // Fall back to mock data
      }
    }

    // Filter by minimum amount
    const filteredData = whaleData.filter((tx) => tx.amountUsd >= minAmount)

    return NextResponse.json({
      transactions: filteredData.slice(0, limit),
      total: filteredData.length,
      summary: {
        totalValue: filteredData.reduce((sum, tx) => sum + tx.amountUsd, 0),
        exchangeDeposits: filteredData.filter((tx) => tx.type === "exchange_deposit").length,
        exchangeWithdrawals: filteredData.filter((tx) => tx.type === "exchange_withdrawal").length,
        transfers: filteredData.filter((tx) => tx.type === "transfer").length,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Whales API error:", error)
    return NextResponse.json({ error: "Failed to fetch whale data" }, { status: 500 })
  }
}
