import type { ExchangeAPIClient, Ticker, OrderRequest } from "../exchange-api-client"
import { database, type TradeRecord } from "../database"

export interface DCAConfig {
  symbol: string
  interval: number // in minutes
  amount: number // USD amount per purchase
  priceDeviation: number // percentage
  maxOrders: number
  stopLoss?: number
  takeProfit?: number
}

export class DCAStrategy {
  private client: ExchangeAPIClient
  private config: DCAConfig
  private botId: string
  private userId: string
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private lastPrice = 0
  private totalInvested = 0
  private totalQuantity = 0
  private orderCount = 0

  constructor(client: ExchangeAPIClient, config: DCAConfig, botId: string, userId: string) {
    this.client = client
    this.config = config
    this.botId = botId
    this.userId = userId
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log(`Starting DCA strategy for ${this.config.symbol}`)

    // Get initial price
    const ticker = await this.client.getTicker(this.config.symbol)
    this.lastPrice = ticker.price

    // Execute first purchase immediately
    await this.executePurchase()

    // Set up interval for subsequent purchases
    this.intervalId = setInterval(
      async () => {
        if (this.isRunning) {
          await this.executePurchase()
        }
      },
      this.config.interval * 60 * 1000,
    )
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log(`Stopped DCA strategy for ${this.config.symbol}`)
  }

  private async executePurchase(): Promise<void> {
    try {
      if (this.orderCount >= this.config.maxOrders) {
        console.log("Max orders reached, stopping DCA")
        await this.stop()
        return
      }

      const ticker = await this.client.getTicker(this.config.symbol)

      // Check price deviation
      if (this.lastPrice > 0) {
        const priceChange = Math.abs((ticker.price - this.lastPrice) / this.lastPrice) * 100
        if (priceChange > this.config.priceDeviation) {
          console.log(`Price deviation too high (${priceChange.toFixed(2)}%), skipping purchase`)
          return
        }
      }

      // Calculate quantity to buy
      const quantity = this.config.amount / ticker.price

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: "buy",
        type: "market",
        amount: quantity,
      }

      console.log(`Executing DCA buy: ${quantity.toFixed(6)} ${this.config.symbol} at $${ticker.price}`)

      const result = await this.client.placeOrder(order)

      // Save trade record
      const trade: Omit<TradeRecord, "_id"> = {
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: "buy",
        type: "market",
        amount: quantity,
        price: result.price,
        fee: 0, // Calculate based on exchange
        status: result.status,
        timestamp: new Date(),
        exchange: "binance", // Should be dynamic
      }

      await database.saveTrade(trade)

      // Update internal tracking
      this.totalInvested += this.config.amount
      this.totalQuantity += quantity
      this.orderCount++
      this.lastPrice = ticker.price

      console.log(
        `DCA purchase completed. Total invested: $${this.totalInvested}, Total quantity: ${this.totalQuantity}`,
      )

      // Check for take profit or stop loss
      await this.checkExitConditions(ticker)
    } catch (error) {
      console.error("DCA purchase failed:", error)
    }
  }

  private async checkExitConditions(ticker: Ticker): Promise<void> {
    if (this.totalQuantity === 0) return

    const avgPrice = this.totalInvested / this.totalQuantity
    const currentValue = this.totalQuantity * ticker.price
    const profitLoss = ((currentValue - this.totalInvested) / this.totalInvested) * 100

    console.log(`Current P&L: ${profitLoss.toFixed(2)}% (Avg: $${avgPrice.toFixed(2)}, Current: $${ticker.price})`)

    // Check take profit
    if (this.config.takeProfit && profitLoss >= this.config.takeProfit) {
      console.log(`Take profit triggered at ${profitLoss.toFixed(2)}%`)
      await this.sellAll(ticker, "take_profit")
      return
    }

    // Check stop loss
    if (this.config.stopLoss && profitLoss <= -this.config.stopLoss) {
      console.log(`Stop loss triggered at ${profitLoss.toFixed(2)}%`)
      await this.sellAll(ticker, "stop_loss")
      return
    }
  }

  private async sellAll(ticker: Ticker, reason: string): Promise<void> {
    try {
      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: "sell",
        type: "market",
        amount: this.totalQuantity,
      }

      console.log(`Selling all ${this.totalQuantity} ${this.config.symbol} due to ${reason}`)

      const result = await this.client.placeOrder(order)

      // Calculate profit
      const sellValue = this.totalQuantity * result.price
      const profit = sellValue - this.totalInvested

      // Save trade record
      const trade: Omit<TradeRecord, "_id"> = {
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: "sell",
        type: "market",
        amount: this.totalQuantity,
        price: result.price,
        fee: 0,
        profit,
        status: result.status,
        timestamp: new Date(),
        exchange: "binance",
      }

      await database.saveTrade(trade)

      console.log(
        `Sell completed. Profit: $${profit.toFixed(2)} (${((profit / this.totalInvested) * 100).toFixed(2)}%)`,
      )

      // Reset for next cycle
      this.totalInvested = 0
      this.totalQuantity = 0
      this.orderCount = 0
    } catch (error) {
      console.error("Sell all failed:", error)
    }
  }

  getStats(): {
    totalInvested: number
    totalQuantity: number
    orderCount: number
    avgPrice: number
    currentValue: number
  } {
    return {
      totalInvested: this.totalInvested,
      totalQuantity: this.totalQuantity,
      orderCount: this.orderCount,
      avgPrice: this.totalQuantity > 0 ? this.totalInvested / this.totalQuantity : 0,
      currentValue: this.totalQuantity * this.lastPrice,
    }
  }
}
