export async function executeTrade(order: {
  exchange: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
}) {
  console.log("Executing trade:", order)
  // Здесь будет логика подключения к API биржи
  return { success: true, orderId: "mock123" }
}
