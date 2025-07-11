export interface PaperTradingConfig {
  initialBalance: number
  commission: number
  slippage: number
  latency: number
  marketImpact: boolean
  realTimeData: boolean
}

export interface PaperOrder {
  id: string
  symbol: string
  side: "BUY" | "SELL"
  type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT"
  quantity: number
  price?: number
  stopPrice?: number
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED"
  filledQuantity: number
  averagePrice?: number
  timestamp: string
  strategy?: string
}

export interface PaperPosition {
  symbol: string
  side: "LONG" | "SHORT"
  quantity: number
  entryPrice: number
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPercentage: number
  entryTime: string
  strategy?: string
}

export interface PaperAccount {
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  unrealizedPnL: number
  realizedPnL: number
}

export interface MarketData {
  symbol: string
  price: number
  bid: number
  ask: number
  volume: number
  timestamp: string
}

export class PaperTradingEngine {
  private config: PaperTradingConfig
  private account: PaperAccount
  private positions: Map<string, PaperPosition> = new Map()
  private orders: Map<string, PaperOrder> = new Map()
  private trades: any[] = []
  private marketData: Map<string, MarketData> = new Map()
  private priceHistory: Map<string, number[]> = new Map()

  constructor(config: PaperTradingConfig) {
    this.config = config
    this.account = {
      balance: config.initialBalance,
      equity: config.initialBalance,
      margin: 0,
      freeMargin: config.initialBalance,
      marginLevel: 0,
      unrealizedPnL: 0,
      realizedPnL: 0,
    }

    // Initialize mock market data
    this.initializeMarketData()

    // Start price simulation if real-time data is enabled
    if (config.realTimeData) {
      this.startPriceSimulation()
    }
  }

  private initializeMarketData(): void {
    const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT", "DOT/USDT"]
    const basePrices = {
      "BTC/USDT": 43000,
      "ETH/USDT": 2500,
      "SOL/USDT": 98,
      "ADA/USDT": 0.48,
      "DOT/USDT": 7.2,
    }

    symbols.forEach((symbol) => {
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const spread = basePrice * 0.001 // 0.1% spread

      this.marketData.set(symbol, {
        symbol,
        price: basePrice,
        bid: basePrice - spread / 2,
        ask: basePrice + spread / 2,
        volume: Math.random() * 1000000,
        timestamp: new Date().toISOString(),
      })

      // Initialize price history
      this.priceHistory.set(symbol, [basePrice])
    })
  }

  private startPriceSimulation(): void {
    setInterval(() => {
      this.marketData.forEach((data, symbol) => {
        // Simulate price movement with random walk
        const volatility = 0.02 // 2% volatility
        const drift = 0.0001 // Small upward drift
        const randomChange = (Math.random() - 0.5) * volatility + drift

        const newPrice = data.price * (1 + randomChange)
        const spread = newPrice * 0.001

        const updatedData: MarketData = {
          ...data,
          price: newPrice,
          bid: newPrice - spread / 2,
          ask: newPrice + spread / 2,
          volume: Math.random() * 1000000,
          timestamp: new Date().toISOString(),
        }

        this.marketData.set(symbol, updatedData)

        // Update price history
        const history = this.priceHistory.get(symbol) || []
        history.push(newPrice)
        if (history.length > 1000) {
          history.shift() // Keep only last 1000 prices
        }
        this.priceHistory.set(symbol, history)

        // Update positions with new prices
        this.updatePositions(symbol, newPrice)
      })

      // Process pending orders
      this.processPendingOrders()
    }, 1000) // Update every second
  }

  private updatePositions(symbol: string, newPrice: number): void {
    const position = this.positions.get(symbol)
    if (!position) return

    const priceDiff = newPrice - position.entryPrice
    const pnl = position.side === "LONG" ? priceDiff * position.quantity : -priceDiff * position.quantity

    const updatedPosition: PaperPosition = {
      ...position,
      currentPrice: newPrice,
      unrealizedPnL: pnl,
      unrealizedPnLPercentage: (pnl / (position.entryPrice * position.quantity)) * 100,
    }

    this.positions.set(symbol, updatedPosition)

    // Update account equity
    this.updateAccountEquity()
  }

  private updateAccountEquity(): void {
    const totalUnrealizedPnL = Array.from(this.positions.values()).reduce((sum, pos) => sum + pos.unrealizedPnL, 0)

    this.account.unrealizedPnL = totalUnrealizedPnL
    this.account.equity = this.account.balance + totalUnrealizedPnL
    this.account.freeMargin = this.account.equity - this.account.margin
    this.account.marginLevel = this.account.margin > 0 ? (this.account.equity / this.account.margin) * 100 : 0
  }

  async placeOrder(
    orderRequest: Omit<PaperOrder, "id" | "status" | "filledQuantity" | "timestamp">,
  ): Promise<PaperOrder> {
    const order: PaperOrder = {
      ...orderRequest,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "PENDING",
      filledQuantity: 0,
      timestamp: new Date().toISOString(),
    }

    // Validate order
    const validation = this.validateOrder(order)
    if (!validation.valid) {
      order.status = "REJECTED"
      this.orders.set(order.id, order)
      throw new Error(validation.reason)
    }

    this.orders.set(order.id, order)

    // For market orders, execute immediately
    if (order.type === "MARKET") {
      await this.executeOrder(order)
    }

    return order
  }

  private validateOrder(order: PaperOrder): { valid: boolean; reason?: string } {
    const marketData = this.marketData.get(order.symbol)
    if (!marketData) {
      return { valid: false, reason: "Symbol not found" }
    }

    // Check if we have enough balance
    const requiredMargin = this.calculateRequiredMargin(order)
    if (requiredMargin > this.account.freeMargin) {
      return { valid: false, reason: "Insufficient margin" }
    }

    // Check minimum order size
    if (order.quantity < 0.001) {
      return { valid: false, reason: "Order size too small" }
    }

    return { valid: true }
  }

  private calculateRequiredMargin(order: PaperOrder): number {
    const marketData = this.marketData.get(order.symbol)
    if (!marketData) return 0

    const price =
      order.type === "MARKET"
        ? order.side === "BUY"
          ? marketData.ask
          : marketData.bid
        : order.price || marketData.price

    return price * order.quantity * 0.1 // 10x leverage
  }

  private async executeOrder(order: PaperOrder): Promise<void> {
    const marketData = this.marketData.get(order.symbol)
    if (!marketData) return

    // Simulate latency
    if (this.config.latency > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.latency))
    }

    // Calculate execution price with slippage
    let executionPrice: number
    if (order.type === "MARKET") {
      const basePrice = order.side === "BUY" ? marketData.ask : marketData.bid
      const slippageAmount = basePrice * this.config.slippage * (Math.random() - 0.5) * 2
      executionPrice = basePrice + slippageAmount
    } else {
      executionPrice = order.price || marketData.price
    }

    // Calculate commission
    const commission = executionPrice * order.quantity * this.config.commission

    // Update order
    order.status = "FILLED"
    order.filledQuantity = order.quantity
    order.averagePrice = executionPrice

    // Update position
    this.updatePosition(order, executionPrice)

    // Update account balance
    this.account.balance -= commission
    this.account.realizedPnL -= commission

    // Record trade
    this.recordTrade(order, executionPrice, commission)

    this.orders.set(order.id, order)
  }

  private updatePosition(order: PaperOrder, executionPrice: number): void {
    const existingPosition = this.positions.get(order.symbol)

    if (!existingPosition) {
      // Create new position
      const newPosition: PaperPosition = {
        symbol: order.symbol,
        side: order.side === "BUY" ? "LONG" : "SHORT",
        quantity: order.quantity,
        entryPrice: executionPrice,
        currentPrice: executionPrice,
        unrealizedPnL: 0,
        unrealizedPnLPercentage: 0,
        entryTime: order.timestamp,
        strategy: order.strategy,
      }
      this.positions.set(order.symbol, newPosition)
    } else {
      // Update existing position or close if opposite side
      if (
        (existingPosition.side === "LONG" && order.side === "SELL") ||
        (existingPosition.side === "SHORT" && order.side === "BUY")
      ) {
        if (order.quantity >= existingPosition.quantity) {
          // Close position completely
          const pnl = this.calculateRealizedPnL(existingPosition, executionPrice)
          this.account.balance += pnl
          this.account.realizedPnL += pnl
          this.positions.delete(order.symbol)

          // If order quantity is larger, create new position in opposite direction
          if (order.quantity > existingPosition.quantity) {
            const remainingQuantity = order.quantity - existingPosition.quantity
            const newPosition: PaperPosition = {
              symbol: order.symbol,
              side: order.side === "BUY" ? "LONG" : "SHORT",
              quantity: remainingQuantity,
              entryPrice: executionPrice,
              currentPrice: executionPrice,
              unrealizedPnL: 0,
              unrealizedPnLPercentage: 0,
              entryTime: order.timestamp,
              strategy: order.strategy,
            }
            this.positions.set(order.symbol, newPosition)
          }
        } else {
          // Partially close position
          const closedQuantity = order.quantity
          const remainingQuantity = existingPosition.quantity - closedQuantity
          const pnl = this.calculateRealizedPnL(
            {
              ...existingPosition,
              quantity: closedQuantity,
            },
            executionPrice,
          )

          this.account.balance += pnl
          this.account.realizedPnL += pnl

          // Update position with remaining quantity
          const updatedPosition: PaperPosition = {
            ...existingPosition,
            quantity: remainingQuantity,
          }
          this.positions.set(order.symbol, updatedPosition)
        }
      } else {
        // Same side - increase position
        const totalQuantity = existingPosition.quantity + order.quantity
        const weightedPrice =
          (existingPosition.entryPrice * existingPosition.quantity + executionPrice * order.quantity) / totalQuantity

        const updatedPosition: PaperPosition = {
          ...existingPosition,
          quantity: totalQuantity,
          entryPrice: weightedPrice,
        }
        this.positions.set(order.symbol, updatedPosition)
      }
    }
  }

  private calculateRealizedPnL(position: PaperPosition, exitPrice: number): number {
    const priceDiff = exitPrice - position.entryPrice
    return position.side === "LONG" ? priceDiff * position.quantity : -priceDiff * position.quantity
  }

  private recordTrade(order: PaperOrder, executionPrice: number, commission: number): void {
    const trade = {
      id: `trade_${Date.now()}`,
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: executionPrice,
      commission,
      timestamp: new Date().toISOString(),
      strategy: order.strategy,
    }

    this.trades.push(trade)
  }

  private processPendingOrders(): void {
    this.orders.forEach(async (order) => {
      if (order.status !== "PENDING") return

      const marketData = this.marketData.get(order.symbol)
      if (!marketData) return

      let shouldExecute = false

      switch (order.type) {
        case "LIMIT":
          if (order.side === "BUY" && marketData.ask <= (order.price || 0)) {
            shouldExecute = true
          } else if (order.side === "SELL" && marketData.bid >= (order.price || 0)) {
            shouldExecute = true
          }
          break

        case "STOP":
          if (order.side === "BUY" && marketData.price >= (order.stopPrice || 0)) {
            shouldExecute = true
          } else if (order.side === "SELL" && marketData.price <= (order.stopPrice || 0)) {
            shouldExecute = true
          }
          break

        case "STOP_LIMIT":
          // Convert to limit order when stop price is hit
          if (
            (order.side === "BUY" && marketData.price >= (order.stopPrice || 0)) ||
            (order.side === "SELL" && marketData.price <= (order.stopPrice || 0))
          ) {
            order.type = "LIMIT"
          }
          break
      }

      if (shouldExecute) {
        await this.executeOrder(order)
      }
    })
  }

  // Public methods for accessing data
  getAccount(): PaperAccount {
    this.updateAccountEquity()
    return { ...this.account }
  }

  getPositions(): PaperPosition[] {
    return Array.from(this.positions.values())
  }

  getOrders(): PaperOrder[] {
    return Array.from(this.orders.values())
  }

  getTrades(): any[] {
    return [...this.trades]
  }

  getMarketData(symbol?: string): MarketData | MarketData[] {
    if (symbol) {
      return this.marketData.get(symbol) || null
    }
    return Array.from(this.marketData.values())
  }

  getPriceHistory(symbol: string): number[] {
    return this.priceHistory.get(symbol) || []
  }

  cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId)
    if (!order || order.status !== "PENDING") {
      return false
    }

    order.status = "CANCELLED"
    this.orders.set(orderId, order)
    return true
  }

  closePosition(symbol: string): Promise<boolean> {
    const position = this.positions.get(symbol)
    if (!position) return Promise.resolve(false)

    const closeOrder: Omit<PaperOrder, "id" | "status" | "filledQuantity" | "timestamp"> = {
      symbol,
      side: position.side === "LONG" ? "SELL" : "BUY",
      type: "MARKET",
      quantity: position.quantity,
      strategy: `${position.strategy}_close`,
    }

    return this.placeOrder(closeOrder)
      .then(() => true)
      .catch(() => false)
  }

  reset(): void {
    this.account = {
      balance: this.config.initialBalance,
      equity: this.config.initialBalance,
      margin: 0,
      freeMargin: this.config.initialBalance,
      marginLevel: 0,
      unrealizedPnL: 0,
      realizedPnL: 0,
    }
    this.positions.clear()
    this.orders.clear()
    this.trades = []
  }

  getPerformanceMetrics(): any {
    const totalTrades = this.trades.length
    const winningTrades = this.trades.filter((t) => {
      const position = this.positions.get(t.symbol)
      if (!position) return false
      return position.unrealizedPnL > 0
    }).length

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const totalReturn = ((this.account.equity - this.config.initialBalance) / this.config.initialBalance) * 100

    return {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate,
      totalReturn,
      totalPnL: this.account.realizedPnL + this.account.unrealizedPnL,
      sharpeRatio: this.calculateSharpeRatio(),
      maxDrawdown: this.calculateMaxDrawdown(),
    }
  }

  private calculateSharpeRatio(): number {
    // Simplified Sharpe ratio calculation
    const returns = this.trades.map((t) => {
      const position = this.positions.get(t.symbol)
      return position ? position.unrealizedPnLPercentage : 0
    })

    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? avgReturn / stdDev : 0
  }

  private calculateMaxDrawdown(): number {
    // Simplified max drawdown calculation
    let peak = this.config.initialBalance
    let maxDrawdown = 0

    this.trades.forEach((trade) => {
      const currentEquity = this.account.equity
      if (currentEquity > peak) {
        peak = currentEquity
      }
      const drawdown = ((peak - currentEquity) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return maxDrawdown
  }
}
