// Automated signal generation engine with multiple strategies

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    position: "ABOVE_UPPER" | "BETWEEN" | "BELOW_LOWER";
  };
  sma: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  ema: {
    ema12: number;
    ema26: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number;
  };
  momentum: number;
  stochastic: {
    k: number;
    d: number;
  };
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  high24h: number;
  low24h: number;
  change24h: number;
  timestamp: number;
  ohlcv: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface SignalConfig {
  strategy: string;
  enabled: boolean;
  minConfidence: number;
  maxPositionSize: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  symbols: string[];
  timeframes: string[];
  parameters: Record<string, any>;
}

export interface GeneratedSignal {
  id: string;
  strategy: string;
  symbol: string;
  type: "BUY" | "SELL";
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskScore: number;
  timeframe: string;
  indicators: TechnicalIndicators;
  reasoning: string;
  createdAt: string;
  expiresAt: string;
}

export class SignalGenerator {
  private strategies: Map<string, SignalStrategy> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.strategies.set("rsi-divergence", new RSIDivergenceStrategy());
    this.strategies.set("macd-crossover", new MACDCrossoverStrategy());
    this.strategies.set("bollinger-squeeze", new BollingerSqueezeStrategy());
    this.strategies.set("ai-pattern", new AIPatternStrategy());
    this.strategies.set("volume-breakout", new VolumeBreakoutStrategy());
    this.strategies.set("support-resistance", new SupportResistanceStrategy());
  }

  async startGeneration(configs: SignalConfig[]): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("Starting automated signal generation...");

    // Generate signals every 30 seconds
    this.intervalId = setInterval(async () => {
      await this.generateSignals(configs);
    }, 30000);

    // Generate initial signals
    await this.generateSignals(configs);
  }

  stopGeneration(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log("Stopped automated signal generation");
  }

  private async generateSignals(
    configs: SignalConfig[],
  ): Promise<GeneratedSignal[]> {
    const signals: GeneratedSignal[] = [];

    for (const config of configs.filter((c) => c.enabled)) {
      const strategy = this.strategies.get(config.strategy);
      if (!strategy) continue;

      for (const symbol of config.symbols) {
        for (const timeframe of config.timeframes) {
          try {
            const marketData = await this.getMarketData(symbol, timeframe);
            const indicators = await this.calculateIndicators(marketData);

            const signal = await strategy.generateSignal(
              symbol,
              timeframe,
              marketData,
              indicators,
              config,
            );

            if (signal && signal.confidence >= config.minConfidence) {
              signals.push({
                ...signal,
                id: this.generateSignalId(),
                createdAt: new Date().toISOString(),
                expiresAt: new Date(
                  Date.now() + 4 * 60 * 60 * 1000,
                ).toISOString(), // 4 hours
              });
            }
          } catch (error) {
            console.error(`Error generating signal for ${symbol}:`, error);
          }
        }
      }
    }

    // Emit signals to subscribers
    if (signals.length > 0) {
      this.emitSignals(signals);
    }

    return signals;
  }

  private async getMarketData(
    symbol: string,
    timeframe: string,
  ): Promise<MarketData> {
    // In production, this would fetch real market data from exchanges
    // For now, return mock data
    return {
      symbol,
      price: 43250 + Math.random() * 1000 - 500,
      volume: 1000000 + Math.random() * 500000,
      high24h: 44000,
      low24h: 42500,
      change24h: Math.random() * 10 - 5,
      timestamp: Date.now(),
      ohlcv: this.generateMockOHLCV(100),
    };
  }

  private generateMockOHLCV(count: number) {
    const ohlcv = [];
    let price = 43000;

    for (let i = 0; i < count; i++) {
      const open = price;
      const change = (Math.random() - 0.5) * 200;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      const volume = 50000 + Math.random() * 100000;

      ohlcv.push({
        timestamp: Date.now() - (count - i) * 60000,
        open,
        high,
        low,
        close,
        volume,
      });

      price = close;
    }

    return ohlcv;
  }

  private async calculateIndicators(
    marketData: MarketData,
  ): Promise<TechnicalIndicators> {
    const closes = marketData.ohlcv.map((candle) => candle.close);
    const volumes = marketData.ohlcv.map((candle) => candle.volume);

    return {
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      bollinger: this.calculateBollingerBands(closes, 20, 2),
      sma: {
        sma20: this.calculateSMA(closes, 20),
        sma50: this.calculateSMA(closes, 50),
        sma200: this.calculateSMA(closes, 200),
      },
      ema: {
        ema12: this.calculateEMA(closes, 12),
        ema26: this.calculateEMA(closes, 26),
      },
      volume: {
        current: volumes[volumes.length - 1],
        average: volumes.reduce((a, b) => a + b, 0) / volumes.length,
        ratio:
          volumes[volumes.length - 1] /
          (volumes.reduce((a, b) => a + b, 0) / volumes.length),
      },
      momentum: this.calculateMomentum(closes, 10),
      stochastic: this.calculateStochastic(marketData.ohlcv, 14),
    };
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;

    return 100 - 100 / (1 + rs);
  }

  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateBollingerBands(
    prices: number[],
    period: number,
    stdDev: number,
  ) {
    const sma = this.calculateSMA(prices, period);
    const variance =
      prices
        .slice(-period)
        .reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    const upper = sma + standardDeviation * stdDev;
    const lower = sma - standardDeviation * stdDev;
    const currentPrice = prices[prices.length - 1];

    let position: "ABOVE_UPPER" | "BETWEEN" | "BELOW_LOWER";
    if (currentPrice > upper) position = "ABOVE_UPPER";
    else if (currentPrice < lower) position = "BELOW_LOWER";
    else position = "BETWEEN";

    return { upper, middle: sma, lower, position };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  private calculateMomentum(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0;
    return prices[prices.length - 1] - prices[prices.length - 1 - period];
  }

  private calculateStochastic(ohlcv: any[], period: number) {
    if (ohlcv.length < period) return { k: 50, d: 50 };

    const recentData = ohlcv.slice(-period);
    const currentClose = ohlcv[ohlcv.length - 1].close;
    const highestHigh = Math.max(...recentData.map((d) => d.high));
    const lowestLow = Math.min(...recentData.map((d) => d.low));

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k; // Simplified - normally would be SMA of %K

    return { k, d };
  }

  private generateSignalId(): string {
    return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitSignals(signals: GeneratedSignal[]): void {
    // In production, this would emit to WebSocket clients or message queue
    console.log(
      `Generated ${signals.length} new signals:`,
      signals.map((s) => `${s.symbol} ${s.type} (${s.confidence}%)`),
    );
  }
}

// Base strategy interface
abstract class SignalStrategy {
  abstract generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ): Promise<Omit<GeneratedSignal, "id" | "createdAt" | "expiresAt"> | null>;
}

// RSI Divergence Strategy
class RSIDivergenceStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    const { rsi } = indicators;
    const currentPrice = marketData.price;

    // Look for oversold/overbought conditions
    if (rsi < 30 && indicators.volume.ratio > 1.2) {
      return {
        strategy: "RSI Divergence",
        symbol,
        type: "BUY" as const,
        confidence: Math.min(95, 70 + (30 - rsi)),
        entryPrice: currentPrice,
        targetPrice: currentPrice * 1.06,
        stopLoss: currentPrice * 0.97,
        riskScore: 5.5,
        timeframe,
        indicators,
        reasoning: `RSI oversold at ${rsi.toFixed(1)} with high volume confirmation. Bullish divergence expected.`,
      };
    }

    if (rsi > 70 && indicators.volume.ratio > 1.2) {
      return {
        strategy: "RSI Divergence",
        symbol,
        type: "SELL" as const,
        confidence: Math.min(95, 50 + (rsi - 70)),
        entryPrice: currentPrice,
        targetPrice: currentPrice * 0.94,
        stopLoss: currentPrice * 1.03,
        riskScore: 6.0,
        timeframe,
        indicators,
        reasoning: `RSI overbought at ${rsi.toFixed(1)} with high volume. Bearish reversal likely.`,
      };
    }

    return null;
  }
}

// MACD Crossover Strategy
class MACDCrossoverStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    const { macd } = indicators;
    const currentPrice = marketData.price;

    // Bullish crossover
    if (macd.macd > macd.signal && macd.histogram > 0 && macd.macd > 0) {
      return {
        strategy: "MACD Crossover",
        symbol,
        type: "BUY" as const,
        confidence: 82,
        entryPrice: currentPrice,
        targetPrice: currentPrice * 1.05,
        stopLoss: currentPrice * 0.98,
        riskScore: 4.5,
        timeframe,
        indicators,
        reasoning:
          "MACD bullish crossover confirmed with positive histogram and signal above zero line.",
      };
    }

    // Bearish crossover
    if (macd.macd < macd.signal && macd.histogram < 0 && macd.macd < 0) {
      return {
        strategy: "MACD Crossover",
        symbol,
        type: "SELL" as const,
        confidence: 85,
        entryPrice: currentPrice,
        targetPrice: currentPrice * 0.95,
        stopLoss: currentPrice * 1.02,
        riskScore: 4.0,
        timeframe,
        indicators,
        reasoning:
          "MACD bearish crossover confirmed with negative histogram and signal below zero line.",
      };
    }

    return null;
  }
}

// Bollinger Band Squeeze Strategy
class BollingerSqueezeStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    const { bollinger, volume } = indicators;
    const currentPrice = marketData.price;
    const bandWidth = (bollinger.upper - bollinger.lower) / bollinger.middle;

    // Look for squeeze breakout
    if (bandWidth < 0.1 && volume.ratio > 1.5) {
      const type = currentPrice > bollinger.middle ? "BUY" : "SELL";

      return {
        strategy: "Bollinger Band Squeeze",
        symbol,
        type,
        confidence: 78,
        entryPrice: currentPrice,
        targetPrice:
          type === "BUY" ? bollinger.upper * 1.02 : bollinger.lower * 0.98,
        stopLoss: type === "BUY" ? bollinger.lower : bollinger.upper,
        riskScore: 7.5,
        timeframe,
        indicators,
        reasoning: `Bollinger Band squeeze detected with high volume breakout ${type === "BUY" ? "above" : "below"} middle band.`,
      };
    }

    return null;
  }
}

// AI Pattern Recognition Strategy
class AIPatternStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    // Simulate AI pattern recognition
    const patterns = ["head-shoulders", "triangle", "flag", "wedge"];
    const detectedPattern =
      patterns[Math.floor(Math.random() * patterns.length)];
    const confidence = 75 + Math.random() * 20;

    if (confidence > config.minConfidence) {
      const type = Math.random() > 0.5 ? "BUY" : "SELL";
      const currentPrice = marketData.price;

      return {
        strategy: "AI Pattern Recognition",
        symbol,
        type,
        confidence: Math.round(confidence),
        entryPrice: currentPrice,
        targetPrice: type === "BUY" ? currentPrice * 1.07 : currentPrice * 0.93,
        stopLoss: type === "BUY" ? currentPrice * 0.96 : currentPrice * 1.04,
        riskScore: 6.5,
        timeframe,
        indicators,
        reasoning: `AI detected ${detectedPattern} pattern with ${confidence.toFixed(1)}% confidence. ${type === "BUY" ? "Bullish" : "Bearish"} breakout expected.`,
      };
    }

    return null;
  }
}

// Volume Breakout Strategy
class VolumeBreakoutStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    const { volume, sma } = indicators;
    const currentPrice = marketData.price;

    // High volume breakout above resistance
    if (volume.ratio > 2.0 && currentPrice > sma.sma20 * 1.02) {
      return {
        strategy: "Volume Breakout",
        symbol,
        type: "BUY" as const,
        confidence: 88,
        entryPrice: currentPrice,
        targetPrice: currentPrice * 1.08,
        stopLoss: sma.sma20,
        riskScore: 6.0,
        timeframe,
        indicators,
        reasoning: `High volume breakout (${volume.ratio.toFixed(1)}x average) above 20-day SMA resistance.`,
      };
    }

    // High volume breakdown below support
    if (volume.ratio > 2.0 && currentPrice < sma.sma20 * 0.98) {
      return {
        strategy: "Volume Breakout",
        symbol,
        type: "SELL" as const,
        confidence: 85,
        entryPrice: currentPrice,
        targetPrice: currentPrice * 0.92,
        stopLoss: sma.sma20,
        riskScore: 6.5,
        timeframe,
        indicators,
        reasoning: `High volume breakdown (${volume.ratio.toFixed(1)}x average) below 20-day SMA support.`,
      };
    }

    return null;
  }
}

// Support/Resistance Strategy
class SupportResistanceStrategy extends SignalStrategy {
  async generateSignal(
    symbol: string,
    timeframe: string,
    marketData: MarketData,
    indicators: TechnicalIndicators,
    config: SignalConfig,
  ) {
    const { sma, rsi } = indicators;
    const currentPrice = marketData.price;

    // Bounce from support
    if (
      currentPrice > sma.sma50 * 0.995 &&
      currentPrice < sma.sma50 * 1.005 &&
      rsi < 45
    ) {
      return {
        strategy: "Support/Resistance",
        symbol,
        type: "BUY" as const,
        confidence: 80,
        entryPrice: currentPrice,
        targetPrice: sma.sma20,
        stopLoss: sma.sma50 * 0.97,
        riskScore: 5.0,
        timeframe,
        indicators,
        reasoning:
          "Price bouncing from 50-day SMA support with RSI showing oversold conditions.",
      };
    }

    // Rejection from resistance
    if (
      currentPrice > sma.sma20 * 0.995 &&
      currentPrice < sma.sma20 * 1.005 &&
      rsi > 55
    ) {
      return {
        strategy: "Support/Resistance",
        symbol,
        type: "SELL" as const,
        confidence: 77,
        entryPrice: currentPrice,
        targetPrice: sma.sma50,
        stopLoss: sma.sma20 * 1.03,
        riskScore: 5.5,
        timeframe,
        indicators,
        reasoning:
          "Price rejected at 20-day SMA resistance with RSI showing overbought conditions.",
      };
    }

    return null;
  }
}

export const signalGenerator = new SignalGenerator();
