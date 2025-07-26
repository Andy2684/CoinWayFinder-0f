export interface BacktestConfig {
  strategy: string
  symbol: string
  config: any
  startDate: Date
  endDate: Date
  initialCapital: number
  userId: string
}

export interface BacktestResults {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
  avgTradeReturn: number
  profitFactor: number
  dailyReturns: number[]
  trades: BacktestTrade[]
  equity: EquityPoint[]
  drawdown: number[]
}

export interface BacktestTrade {
  timestamp: Date
  side: "buy" | "sell"
  price: number
  quantity: number
  pnl: number
  commission: number
}

export interface EquityPoint {
  timestamp: Date
  equity: number
}

export class BacktestEngine {
  async runBacktest(config: BacktestConfig): Promise<BacktestResults> {
    // Fetch historical data
    const historicalData = await this.fetchHistoricalData(config.symbol, config.startDate, config.endDate)

    // Initialize backtest state
    const state = {
      capital: config.initialCapital,
      position: 0,
      trades: [] as BacktestTrade[],
      equity: [] as EquityPoint[],
      dailyReturns: [] as number[],
      maxEquity: config.initialCapital,
      maxDrawdown: 0,
    }

    // Run strategy simulation
    for (let i = 1; i < historicalData.length; i++) {
      const currentBar = historicalData[i]
      const previousBar = historicalData[i - 1]

      // Generate trading signal
      const signal = await this.generateSignal(config.strategy, historicalData, i, config.config)

      if (signal) {
        const trade = this.executeTrade(signal, currentBar, state)
        if (trade) {
          state.trades.push(trade)
        }
      }

      // Update equity
      const currentEquity = state.capital + state.position * currentBar.close
      state.equity.push({
        timestamp: currentBar.timestamp,
        equity: currentEquity,
      })

      // Calculate daily return
      if (i > 1) {
        const previousEquity = state.equity[i - 2].equity
        const dailyReturn = (currentEquity - previousEquity) / previousEquity
        state.dailyReturns.push(dailyReturn)
      }

      // Update max drawdown
      if (currentEquity > state.maxEquity) {
        state.maxEquity = currentEquity
      }
      const drawdown = (state.maxEquity - currentEquity) / state.maxEquity
      state.maxDrawdown = Math.max(state.maxDrawdown, drawdown)
    }

    // Calculate final results
    return this.calculateResults(state, config.initialCapital)
  }

  private async fetchHistoricalData(symbol: string, startDate: Date, endDate: Date): Promise<MarketData[]> {
    // In a real implementation, this would fetch from a market data provider
    // For now, generate mock data
    const data: MarketData[] = []
    const current = new Date(startDate)
    let price = 50000 // Starting price

    while (current <= endDate) {
      const change = (Math.random() - 0.5) * 0.02 // ±1% random change
      price *= 1 + change

      data.push({
        timestamp: new Date(current),
        open: price * (1 + (Math.random() - 0.5) * 0.001),
        high: price * (1 + Math.random() * 0.01),
        low: price * (1 - Math.random() * 0.01),
        close: price,
        volume: Math.random() * 1000000,
      })

      current.setDate(current.getDate() + 1)
    }

    return data
  }

  private async generateSignal(
    strategy: string,
    data: MarketData[],
    index: number,
    config: any,
  ): Promise<TradingSignal | null> {
    switch (strategy) {
      case "dca":
        return this.generateDCASignal(data, index, config)
      case "grid":
        return this.generateGridSignal(data, index, config)
      case "momentum":
        return this.generateMomentumSignal(data, index, config)
      case "mean-reversion":
        return this.generateMeanReversionSignal(data, index, config)
      default:
        return null
    }
  }

  private generateDCASignal(data: MarketData[], index: number, config: any): TradingSignal | null {
    // DCA: Buy every N days
    const interval = config.interval || 7
    if (index % interval === 0) {
      return {
        side: "buy",
        type: "market",
        amount: config.amount || 100,
      }
    }
    return null
  }

  private generateGridSignal(data: MarketData[], index: number, config: any): TradingSignal | null {
    // Grid trading logic
    const currentPrice = data[index].close
    const gridSpacing = config.gridSpacing || 0.02
    const basePrice = config.basePrice || data[0].close

    // Simplified grid logic
    const gridLevel = Math.floor((currentPrice - basePrice) / (basePrice * gridSpacing))

    if (gridLevel < -1) {
      return { side: "buy", type: "market", amount: config.amount || 100 }
    } else if (gridLevel > 1) {
      return { side: "sell", type: "market", amount: config.amount || 100 }
    }

    return null
  }

  private generateMomentumSignal(data: MarketData[], index: number, config: any): TradingSignal | null {
    if (index < 20) return null

    const period = config.period || 14
    const threshold = config.threshold || 0.02

    // Calculate momentum
    const currentPrice = data[index].close
    const pastPrice = data[index - period].close
    const momentum = (currentPrice - pastPrice) / pastPrice

    if (momentum > threshold) {
      return { side: "buy", type: "market", amount: config.amount || 100 }
    } else if (momentum < -threshold) {
      return { side: "sell", type: "market", amount: config.amount || 100 }
    }

    return null
  }

  private generateMeanReversionSignal(data: MarketData[], index: number, config: any): TradingSignal | null {
    if (index < 20) return null

    const period = config.period || 20
    const threshold = config.threshold || 2

    // Calculate Bollinger Bands
    const prices = data.slice(index - period, index).map((d) => d.close)
    const sma = prices.reduce((sum, price) => sum + price, 0) / period
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    const currentPrice = data[index].close
    const upperBand = sma + threshold * stdDev
    const lowerBand = sma - threshold * stdDev

    if (currentPrice < lowerBand) {
      return { side: "buy", type: "market", amount: config.amount || 100 }
    } else if (currentPrice > upperBand) {
      return { side: "sell", type: "market", amount: config.amount || 100 }
    }

    return null
  }

  private executeTrade(signal: TradingSignal, bar: MarketData, state: any): BacktestTrade | null {
    const commission = 0.001 // 0.1% commission
    const price = bar.close
    const quantity = signal.amount / price

    let trade: BacktestTrade | null = null

    if (signal.side === "buy") {
      const cost = signal.amount + signal.amount * commission
      if (state.capital >= cost) {
        state.capital -= cost
        state.position += quantity

        trade = {
          timestamp: bar.timestamp,
          side: "buy",
          price,
          quantity,
          pnl: 0,
          commission: signal.amount * commission,
        }
      }
    } else if (signal.side === "sell" && state.position > 0) {
      const proceeds = quantity * price
      const commissionCost = proceeds * commission

      state.capital += proceeds - commissionCost
      state.position -= quantity

      trade = {
        timestamp: bar.timestamp,
        side: "sell",
        price,
        quantity,
        pnl: 0, // PnL would be calculated based on entry price
        commission: commissionCost,
      }
    }

    return trade
  }

  private calculateResults(state: any, initialCapital: number): BacktestResults {
    const finalEquity = state.equity[state.equity.length - 1]?.equity || initialCapital
    const totalReturn = finalEquity - initialCapital
    const totalReturnPercent = (totalReturn / initialCapital) * 100

    // Calculate annualized return
    const days = state.equity.length
    const years = days / 365
    const annualizedReturn = Math.pow(finalEquity / initialCapital, 1 / years) - 1

    // Calculate Sharpe ratio
    const avgDailyReturn = state.dailyReturns.reduce((sum, ret) => sum + ret, 0) / state.dailyReturns.length
    const dailyReturnStd = Math.sqrt(
      state.dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / state.dailyReturns.length,
    )
    const sharpeRatio = (avgDailyReturn * Math.sqrt(252)) / (dailyReturnStd * Math.sqrt(252))

    // Calculate win rate
    const winningTrades = state.trades.filter((trade: BacktestTrade) => trade.pnl > 0).length
    const winRate = state.trades.length > 0 ? (winningTrades / state.trades.length) * 100 : 0

    // Calculate profit factor
    const grossProfit = state.trades.filter((t: BacktestTrade) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(state.trades.filter((t: BacktestTrade) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn: annualizedReturn * 100,
      maxDrawdown: state.maxDrawdown * 100,
      sharpeRatio,
      winRate,
      totalTrades: state.trades.length,
      avgTradeReturn: state.trades.length > 0 ? totalReturn / state.trades.length : 0,
      profitFactor,
      dailyReturns: state.dailyReturns,
      trades: state.trades,
      equity: state.equity,
      drawdown: state.equity.map((point: EquityPoint, index: number) => {
        const maxEquityToDate = Math.max(...state.equity.slice(0, index + 1).map((p: EquityPoint) => p.equity))
        return ((maxEquityToDate - point.equity) / maxEquityToDate) * 100
      }),
    }
  }
}

interface MarketData {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TradingSignal {
  side: "buy" | "sell"
  type: "market" | "limit"
  amount: number
  price?: number
}
