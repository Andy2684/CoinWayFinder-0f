export async function updatePortfolioPosition({
  userId,
  symbol,
  quantity,
  averagePrice,
  currentPrice,
}: {
  userId: string
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice?: number
}) {
  return {
    id: "mock-id",
    userId,
    symbol,
    quantity,
    averagePrice,
    currentPrice,
  }
}
