// Automated signal execution engine with risk management

import { ExchangeAdapterFactory } from "./exchange-adapters";
import {
  TradeExecutionEngine,
  type TradeOrder,
  type RiskLimits,
} from "./trade-execution-engine";

export interface ExecutionConfig {
  enabled: boolean;
  maxConcurrentSignals: number;
  maxDailyLoss: number;
  maxPositionSize: number;
  riskPerTrade: number;
  stopLossEnabled: boolean;
  takeProfitEnabled: boolean;
  trailingStopEnabled: boolean;
  exchangePreferences: string[];
}

export interface SignalExecution {
  signalId: string;
  orderId?: string;
  status: "PENDING" | "EXECUTED" | "FAILED" | "CANCELLED";
  executionPrice?: number;
  executionTime?: string;
  error?: string;
  exchange: string;
  quantity: number;
  fees?: number;
}

export interface ExecutionMetrics {
  totalExecuted: number;
  successRate: number;
  averageSlippage: number;
  totalFees: number;
  totalPnL: number;
  activePositions: number;
}

export class SignalExecutor {
  private executionEngine: TradeExecutionEngine;
  private config: ExecutionConfig;
  private executions: Map<string, SignalExecution> = new Map();
  private activePositions: Map<string, any> = new Map();
  private dailyLoss = 0;
  private isEnabled = false;

  constructor(config: ExecutionConfig) {
    this.config = config;
    this.isEnabled = config.enabled;

    const riskLimits: RiskLimits = {
      maxPositionSize: config.maxPositionSize,
      maxDailyLoss: config.maxDailyLoss,
      maxOrderValue: config.maxPositionSize * 50000, // Assume max $50k per unit
      allowedPairs: [], // Will be populated from signal symbols
      blockedPairs: [],
    };

    this.executionEngine = new TradeExecutionEngine(riskLimits);
  }

  async executeSignal(signal: any): Promise<SignalExecution> {
    if (!this.isEnabled) {
      return {
        signalId: signal.id,
        status: "CANCELLED",
        error: "Execution disabled",
        exchange: "",
        quantity: 0,
      };
    }

    // Pre-execution checks
    const preCheckResult = await this.performPreExecutionChecks(signal);
    if (!preCheckResult.passed) {
      return {
        signalId: signal.id,
        status: "FAILED",
        error: preCheckResult.reason,
        exchange: "",
        quantity: 0,
      };
    }

    // Calculate position size
    const quantity = this.calculatePositionSize(signal);

    // Select best exchange
    const exchange = this.selectBestExchange(signal.symbol);

    // Create trade order
    const order: TradeOrder = {
      id: `order_${signal.id}`,
      exchangeId: exchange,
      symbol: signal.symbol,
      side: signal.type.toLowerCase() as "buy" | "sell",
      type: "market", // Start with market orders for simplicity
      amount: quantity,
      strategy: signal.strategy,
      maxRetries: 3,
      retryDelay: 1000,
    };

    try {
      // Execute the order
      const result = await this.executionEngine.executeOrder(order);

      const execution: SignalExecution = {
        signalId: signal.id,
        orderId: result.orderId,
        status: result.success ? "EXECUTED" : "FAILED",
        executionPrice: signal.entryPrice, // In production, get actual execution price
        executionTime: new Date().toISOString(),
        error: result.error,
        exchange,
        quantity,
        fees: this.estimateFees(quantity, signal.entryPrice, exchange),
      };

      this.executions.set(signal.id, execution);

      if (result.success) {
        // Track active position
        this.activePositions.set(signal.id, {
          ...signal,
          quantity,
          exchange,
          executionPrice: signal.entryPrice,
          orderId: result.orderId,
        });

        // Set up stop loss and take profit orders
        if (this.config.stopLossEnabled) {
          await this.setStopLoss(signal, quantity, exchange);
        }

        if (this.config.takeProfitEnabled) {
          await this.setTakeProfit(signal, quantity, exchange);
        }
      }

      return execution;
    } catch (error) {
      const execution: SignalExecution = {
        signalId: signal.id,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        exchange,
        quantity,
      };

      this.executions.set(signal.id, execution);
      return execution;
    }
  }

  private async performPreExecutionChecks(
    signal: any,
  ): Promise<{ passed: boolean; reason?: string }> {
    // Check if execution is enabled
    if (!this.isEnabled) {
      return { passed: false, reason: "Execution disabled" };
    }

    // Check daily loss limit
    if (this.dailyLoss >= this.config.maxDailyLoss) {
      return { passed: false, reason: "Daily loss limit reached" };
    }

    // Check concurrent signals limit
    if (this.activePositions.size >= this.config.maxConcurrentSignals) {
      return { passed: false, reason: "Maximum concurrent signals reached" };
    }

    // Check signal confidence
    if (signal.confidence < 70) {
      return { passed: false, reason: "Signal confidence too low" };
    }

    // Check signal expiry
    if (new Date(signal.expiresAt) < new Date()) {
      return { passed: false, reason: "Signal expired" };
    }

    // Check if we already have a position in this symbol
    const existingPosition = Array.from(this.activePositions.values()).find(
      (pos) => pos.symbol === signal.symbol,
    );

    if (existingPosition) {
      return { passed: false, reason: "Already have position in this symbol" };
    }

    return { passed: true };
  }

  private calculatePositionSize(signal: any): number {
    // Calculate position size based on risk per trade
    const accountBalance = 10000; // In production, get from exchange
    const riskAmount = accountBalance * (this.config.riskPerTrade / 100);

    // Calculate stop loss distance
    const stopDistance = Math.abs(signal.entryPrice - signal.stopLoss);
    const stopDistancePercent = stopDistance / signal.entryPrice;

    // Position size = Risk Amount / Stop Distance
    let positionSize = riskAmount / stopDistance;

    // Apply maximum position size limit
    positionSize = Math.min(positionSize, this.config.maxPositionSize);

    // Ensure minimum viable position size
    positionSize = Math.max(positionSize, 0.001);

    return Number(positionSize.toFixed(6));
  }

  private selectBestExchange(symbol: string): string {
    // In production, this would consider:
    // - Exchange availability for the symbol
    // - Liquidity and spread
    // - Fees
    // - User preferences
    // - API rate limits

    const availableExchanges = this.config.exchangePreferences.filter(
      (exchange) => {
        const adapter = ExchangeAdapterFactory.getAdapter(exchange);
        return adapter !== null;
      },
    );

    return availableExchanges[0] || "binance";
  }

  private estimateFees(
    quantity: number,
    price: number,
    exchange: string,
  ): number {
    // Estimate trading fees based on exchange
    const feeRates = {
      binance: 0.001,
      bybit: 0.001,
      okx: 0.0008,
      kucoin: 0.001,
      coinbase: 0.005,
    };

    const feeRate = feeRates[exchange as keyof typeof feeRates] || 0.001;
    return quantity * price * feeRate;
  }

  private async setStopLoss(
    signal: any,
    quantity: number,
    exchange: string,
  ): Promise<void> {
    try {
      const adapter = ExchangeAdapterFactory.getAdapter(exchange);
      if (!adapter) return;

      const stopOrder: TradeOrder = {
        id: `stop_${signal.id}`,
        exchangeId: exchange,
        symbol: signal.symbol,
        side: signal.type === "BUY" ? "sell" : "buy",
        type: "stop",
        amount: quantity,
        stopPrice: signal.stopLoss,
        strategy: `${signal.strategy}_stop`,
        maxRetries: 2,
        retryDelay: 1000,
      };

      await this.executionEngine.executeOrder(stopOrder);
    } catch (error) {
      console.error("Failed to set stop loss:", error);
    }
  }

  private async setTakeProfit(
    signal: any,
    quantity: number,
    exchange: string,
  ): Promise<void> {
    try {
      const adapter = ExchangeAdapterFactory.getAdapter(exchange);
      if (!adapter) return;

      const takeProfitOrder: TradeOrder = {
        id: `tp_${signal.id}`,
        exchangeId: exchange,
        symbol: signal.symbol,
        side: signal.type === "BUY" ? "sell" : "buy",
        type: "limit",
        amount: quantity,
        price: signal.targetPrice,
        strategy: `${signal.strategy}_tp`,
        maxRetries: 2,
        retryDelay: 1000,
      };

      await this.executionEngine.executeOrder(takeProfitOrder);
    } catch (error) {
      console.error("Failed to set take profit:", error);
    }
  }

  async closePosition(signalId: string): Promise<boolean> {
    const position = this.activePositions.get(signalId);
    if (!position) return false;

    try {
      const adapter = ExchangeAdapterFactory.getAdapter(position.exchange);
      if (!adapter) return false;

      const closeOrder: TradeOrder = {
        id: `close_${signalId}`,
        exchangeId: position.exchange,
        symbol: position.symbol,
        side: position.type === "BUY" ? "sell" : "buy",
        type: "market",
        amount: position.quantity,
        strategy: `${position.strategy}_close`,
        maxRetries: 3,
        retryDelay: 1000,
      };

      const result = await this.executionEngine.executeOrder(closeOrder);

      if (result.success) {
        this.activePositions.delete(signalId);

        // Update execution record
        const execution = this.executions.get(signalId);
        if (execution) {
          execution.status = "EXECUTED";
        }
      }

      return result.success;
    } catch (error) {
      console.error("Failed to close position:", error);
      return false;
    }
  }

  getExecutionMetrics(): ExecutionMetrics {
    const executions = Array.from(this.executions.values());
    const successful = executions.filter((e) => e.status === "EXECUTED");

    return {
      totalExecuted: executions.length,
      successRate:
        executions.length > 0
          ? (successful.length / executions.length) * 100
          : 0,
      averageSlippage: 0.1, // Mock data
      totalFees: executions.reduce((sum, e) => sum + (e.fees || 0), 0),
      totalPnL: 0, // Would calculate from position P&L
      activePositions: this.activePositions.size,
    };
  }

  getActivePositions() {
    return Array.from(this.activePositions.values());
  }

  getExecutionHistory() {
    return Array.from(this.executions.values());
  }

  updateConfig(newConfig: Partial<ExecutionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = this.config.enabled;
  }

  emergencyStop(): void {
    this.isEnabled = false;
    this.executionEngine.emergencyStop();
    console.log("Emergency stop activated - all execution halted");
  }

  resume(): void {
    this.isEnabled = this.config.enabled;
    this.executionEngine.resume();
    console.log("Execution resumed");
  }
}
