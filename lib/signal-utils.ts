import type { Signal } from "./signals-api";

export function calculateSignalProgress(signal: Signal): number {
  const { type, entryPrice, currentPrice, targetPrice } = signal;

  if (type === "BUY") {
    if (currentPrice <= entryPrice) return 0;
    if (currentPrice >= targetPrice) return 100;
    return ((currentPrice - entryPrice) / (targetPrice - entryPrice)) * 100;
  } else {
    if (currentPrice >= entryPrice) return 0;
    if (currentPrice <= targetPrice) return 100;
    return ((entryPrice - currentPrice) / (entryPrice - targetPrice)) * 100;
  }
}

export function calculatePnL(signal: Signal): {
  pnl: number;
  pnlPercentage: number;
} {
  const { type, entryPrice, currentPrice } = signal;

  if (type === "BUY") {
    const pnl = currentPrice - entryPrice;
    const pnlPercentage = (pnl / entryPrice) * 100;
    return { pnl, pnlPercentage };
  } else {
    const pnl = entryPrice - currentPrice;
    const pnlPercentage = (pnl / entryPrice) * 100;
    return { pnl, pnlPercentage };
  }
}

export function calculateRiskReward(
  entryPrice: number,
  targetPrice: number,
  stopLoss: number,
  type: "BUY" | "SELL",
): number | null {
  if (!entryPrice || !targetPrice || !stopLoss) return null;

  const reward =
    type === "BUY" ? targetPrice - entryPrice : entryPrice - targetPrice;
  const risk = type === "BUY" ? entryPrice - stopLoss : stopLoss - entryPrice;

  if (risk <= 0) return null;

  return reward / risk;
}

export function getSignalStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-blue-500";
    case "COMPLETED":
      return "bg-green-500";
    case "STOPPED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function getRiskLevelColor(risk: string): string {
  switch (risk) {
    case "LOW":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "HIGH":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

export function validateSignalData(signalData: Partial<Signal>): string[] {
  const errors: string[] = [];

  if (!signalData.symbol) errors.push("Symbol is required");
  if (!signalData.type) errors.push("Signal type is required");
  if (!signalData.strategy) errors.push("Strategy is required");
  if (!signalData.entryPrice || signalData.entryPrice <= 0)
    errors.push("Valid entry price is required");
  if (!signalData.targetPrice || signalData.targetPrice <= 0)
    errors.push("Valid target price is required");
  if (!signalData.stopLoss || signalData.stopLoss <= 0)
    errors.push("Valid stop loss is required");
  if (!signalData.timeframe) errors.push("Timeframe is required");
  if (!signalData.exchange) errors.push("Exchange is required");

  // Validate price logic
  if (signalData.entryPrice && signalData.targetPrice && signalData.stopLoss) {
    if (signalData.type === "BUY") {
      if (signalData.targetPrice <= signalData.entryPrice) {
        errors.push(
          "Target price must be higher than entry price for BUY signals",
        );
      }
      if (signalData.stopLoss >= signalData.entryPrice) {
        errors.push("Stop loss must be lower than entry price for BUY signals");
      }
    } else if (signalData.type === "SELL") {
      if (signalData.targetPrice >= signalData.entryPrice) {
        errors.push(
          "Target price must be lower than entry price for SELL signals",
        );
      }
      if (signalData.stopLoss <= signalData.entryPrice) {
        errors.push(
          "Stop loss must be higher than entry price for SELL signals",
        );
      }
    }
  }

  return errors;
}

export function generateSignalId(): string {
  return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function filterSignals(signals: Signal[], filters: any): Signal[] {
  return signals.filter((signal) => {
    // Symbol filter
    if (
      filters.symbols?.length > 0 &&
      !filters.symbols.includes(signal.symbol)
    ) {
      return false;
    }

    // Strategy filter
    if (
      filters.strategies?.length > 0 &&
      !filters.strategies.includes(signal.strategy)
    ) {
      return false;
    }

    // Exchange filter
    if (
      filters.exchanges?.length > 0 &&
      !filters.exchanges.includes(signal.exchange)
    ) {
      return false;
    }

    // Timeframe filter
    if (
      filters.timeframes?.length > 0 &&
      !filters.timeframes.includes(signal.timeframe)
    ) {
      return false;
    }

    // Risk level filter
    if (
      filters.riskLevels?.length > 0 &&
      !filters.riskLevels.includes(signal.riskLevel)
    ) {
      return false;
    }

    // Confidence range filter
    if (filters.confidenceRange) {
      const [min, max] = filters.confidenceRange;
      if (signal.confidence < min || signal.confidence > max) {
        return false;
      }
    }

    // P&L range filter
    if (filters.pnlRange) {
      const [min, max] = filters.pnlRange;
      if (signal.pnlPercentage < min || signal.pnlPercentage > max) {
        return false;
      }
    }

    // Status filter
    if (
      filters.status &&
      filters.status !== "all" &&
      signal.status !== filters.status.toUpperCase()
    ) {
      return false;
    }

    return true;
  });
}
