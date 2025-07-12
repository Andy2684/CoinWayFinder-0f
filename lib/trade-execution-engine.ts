// Unified trade execution engine with retry logic and risk protection

import {
  ExchangeAdapterFactory,
  type ExchangeAdapter,
} from "./exchange-adapters";

export interface TradeOrder {
  id: string;
  exchangeId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  amount: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: "GTC" | "IOC" | "FOK";
  strategy: string;
  maxRetries: number;
  retryDelay: number;
}

export interface RiskLimits {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxOrderValue: number;
  allowedPairs: string[];
  blockedPairs: string[];
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string;
  error?: string;
  retries: number;
  executionTime: number;
  exchange: string;
}

export class TradeExecutionEngine {
  private riskLimits: RiskLimits;
  private dailyLoss = 0;
  private activeOrders: Map<string, TradeOrder> = new Map();
  private executionQueue: TradeOrder[] = [];
  private isProcessing = false;

  constructor(riskLimits: RiskLimits) {
    this.riskLimits = riskLimits;
    this.startProcessing();
  }

  async executeOrder(order: TradeOrder): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Pre-execution risk checks
    const riskCheck = this.performRiskChecks(order);
    if (!riskCheck.passed) {
      return {
        success: false,
        error: riskCheck.reason,
        retries: 0,
        executionTime: Date.now() - startTime,
        exchange: order.exchangeId,
      };
    }

    // Get exchange adapter
    const adapter = ExchangeAdapterFactory.getAdapter(order.exchangeId);
    if (!adapter) {
      return {
        success: false,
        error: `Exchange adapter not found: ${order.exchangeId}`,
        retries: 0,
        executionTime: Date.now() - startTime,
        exchange: order.exchangeId,
      };
    }

    // Execute with retry logic
    let retries = 0;
    let lastError = "";

    while (retries <= order.maxRetries) {
      try {
        const result = await this.executeOnExchange(adapter, order);

        if (result.success) {
          this.activeOrders.set(order.id, order);
          return {
            success: true,
            orderId: result.orderId,
            retries,
            executionTime: Date.now() - startTime,
            exchange: order.exchangeId,
          };
        } else {
          lastError = result.error || "Unknown error";
          retries++;

          if (retries <= order.maxRetries) {
            await this.delay(order.retryDelay * retries); // Exponential backoff
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Execution failed";
        retries++;

        if (retries <= order.maxRetries) {
          await this.delay(order.retryDelay * retries);
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${retries} retries: ${lastError}`,
      retries,
      executionTime: Date.now() - startTime,
      exchange: order.exchangeId,
    };
  }

  private async executeOnExchange(
    adapter: ExchangeAdapter,
    order: TradeOrder,
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      let result: any;

      switch (order.type) {
        case "market":
          result = await adapter.placeMarketOrder(
            order.symbol,
            order.side,
            order.amount,
          );
          break;
        case "limit":
          if (!order.price) {
            throw new Error("Price required for limit order");
          }
          result = await adapter.placeLimitOrder(
            order.symbol,
            order.side,
            order.amount,
            order.price,
          );
          break;
        case "stop":
          // Implementation depends on exchange-specific stop order logic
          throw new Error("Stop orders not yet implemented");
        default:
          throw new Error(`Unsupported order type: ${order.type}`);
      }

      // Parse exchange-specific response
      const orderId = this.extractOrderId(result, adapter.id);

      if (orderId) {
        return { success: true, orderId };
      } else {
        return { success: false, error: "Order ID not found in response" };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown execution error",
      };
    }
  }

  private extractOrderId(result: any, exchangeId: string): string | null {
    switch (exchangeId) {
      case "binance":
        return result.orderId?.toString() || null;
      case "bybit":
        return result.result?.orderId || null;
      case "okx":
        return result.data?.[0]?.ordId || null;
      default:
        return result.orderId || result.id || null;
    }
  }

  private performRiskChecks(order: TradeOrder): {
    passed: boolean;
    reason?: string;
  } {
    // Check if pair is allowed
    if (this.riskLimits.blockedPairs.includes(order.symbol)) {
      return {
        passed: false,
        reason: `Trading pair ${order.symbol} is blocked`,
      };
    }

    if (
      this.riskLimits.allowedPairs.length > 0 &&
      !this.riskLimits.allowedPairs.includes(order.symbol)
    ) {
      return {
        passed: false,
        reason: `Trading pair ${order.symbol} is not in allowed list`,
      };
    }

    // Check position size
    if (order.amount > this.riskLimits.maxPositionSize) {
      return {
        passed: false,
        reason: `Order amount ${order.amount} exceeds max position size ${this.riskLimits.maxPositionSize}`,
      };
    }

    // Check order value
    const orderValue = order.price
      ? order.amount * order.price
      : order.amount * 50000; // Estimate for market orders
    if (orderValue > this.riskLimits.maxOrderValue) {
      return {
        passed: false,
        reason: `Order value $${orderValue} exceeds max order value $${this.riskLimits.maxOrderValue}`,
      };
    }

    // Check daily loss limit
    if (this.dailyLoss >= this.riskLimits.maxDailyLoss) {
      return {
        passed: false,
        reason: `Daily loss limit of $${this.riskLimits.maxDailyLoss} reached`,
      };
    }

    return { passed: true };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.isProcessing) {
      if (this.executionQueue.length > 0) {
        const order = this.executionQueue.shift();
        if (order) {
          await this.executeOrder(order);
        }
      } else {
        await this.delay(100); // Wait 100ms before checking queue again
      }
    }
  }

  public addToQueue(order: TradeOrder): void {
    this.executionQueue.push(order);
  }

  public getQueueLength(): number {
    return this.executionQueue.length;
  }

  public getActiveOrders(): TradeOrder[] {
    return Array.from(this.activeOrders.values());
  }

  public updateDailyLoss(loss: number): void {
    this.dailyLoss += loss;
  }

  public resetDailyLoss(): void {
    this.dailyLoss = 0;
  }

  public emergencyStop(): void {
    this.isProcessing = false;
    this.executionQueue.length = 0;
    console.log("Emergency stop activated - all trading halted");
  }

  public resume(): void {
    this.isProcessing = true;
    this.processQueue();
    console.log("Trading resumed");
  }
}
