// Bot strategy configurations and utilities

export interface BotStrategy {
  id: string;
  name: string;
  description: string;
  category:
    | "dca"
    | "grid"
    | "scalping"
    | "momentum"
    | "arbitrage"
    | "mean-reversion"
    | "ai-adaptive"
    | "portfolio";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  riskLevel: "Low" | "Medium" | "Medium-High" | "High";
  timeframe: string;
  minInvestment: number;
  avgReturn: string;
  features: string[];
  parameters: BotParameter[];
}

export interface BotParameter {
  key: string;
  name: string;
  type: "number" | "percentage" | "boolean" | "select";
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
}

export const botStrategies: BotStrategy[] = [
  {
    id: "dca",
    name: "DCA (Dollar Cost Averaging)",
    description:
      "Automatically buy crypto at regular intervals regardless of price",
    category: "dca",
    difficulty: "Beginner",
    riskLevel: "Low",
    timeframe: "Long-term",
    minInvestment: 100,
    avgReturn: "8-15% annually",
    features: [
      "Fixed interval purchases",
      "Price averaging effect",
      "Emotion-free investing",
      "Customizable schedules",
    ],
    parameters: [
      {
        key: "interval",
        name: "Purchase Interval",
        type: "select",
        defaultValue: "daily",
        options: ["hourly", "daily", "weekly", "monthly"],
        description: "How often to make purchases",
      },
      {
        key: "amount",
        name: "Purchase Amount ($)",
        type: "number",
        defaultValue: 50,
        min: 10,
        max: 10000,
        description: "Amount to invest per interval",
      },
      {
        key: "priceDeviation",
        name: "Price Deviation Limit (%)",
        type: "percentage",
        defaultValue: 5,
        min: 1,
        max: 20,
        description: "Skip purchase if price moved more than this %",
      },
    ],
  },
  {
    id: "grid",
    name: "Grid Trading",
    description:
      "Place buy and sell orders at predetermined intervals above and below current price",
    category: "grid",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    timeframe: "Short-Medium",
    minInvestment: 500,
    avgReturn: "15-25% annually",
    features: [
      "Automated grid orders",
      "Profit from volatility",
      "Range-bound markets",
      "Dynamic rebalancing",
    ],
    parameters: [
      {
        key: "gridLevels",
        name: "Grid Levels",
        type: "number",
        defaultValue: 10,
        min: 5,
        max: 50,
        description: "Number of buy/sell levels in the grid",
      },
      {
        key: "gridSpacing",
        name: "Grid Spacing (%)",
        type: "percentage",
        defaultValue: 2,
        min: 0.5,
        max: 10,
        step: 0.1,
        description: "Price difference between grid levels",
      },
      {
        key: "upperLimit",
        name: "Upper Price Limit ($)",
        type: "number",
        defaultValue: 0,
        min: 0,
        description: "Maximum price for grid (0 = no limit)",
      },
      {
        key: "lowerLimit",
        name: "Lower Price Limit ($)",
        type: "number",
        defaultValue: 0,
        min: 0,
        description: "Minimum price for grid (0 = no limit)",
      },
    ],
  },
  {
    id: "scalping",
    name: "Scalping Bot",
    description:
      "High-frequency trading capturing small price movements throughout the day",
    category: "scalping",
    difficulty: "Advanced",
    riskLevel: "High",
    timeframe: "Very Short",
    minInvestment: 1000,
    avgReturn: "20-40% annually",
    features: [
      "High-frequency trades",
      "Small profit margins",
      "Quick execution",
      "Technical indicators",
    ],
    parameters: [
      {
        key: "profitTarget",
        name: "Profit Target (%)",
        type: "percentage",
        defaultValue: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        description: "Target profit per trade",
      },
      {
        key: "maxHoldTime",
        name: "Max Hold Time (minutes)",
        type: "number",
        defaultValue: 15,
        min: 1,
        max: 60,
        description: "Maximum time to hold a position",
      },
      {
        key: "volumeThreshold",
        name: "Volume Threshold",
        type: "number",
        defaultValue: 1000000,
        min: 100000,
        description: "Minimum 24h volume required",
      },
    ],
  },
];

export function getBotStrategy(id: string): BotStrategy | undefined {
  return botStrategies.find((strategy) => strategy.id === id);
}

export function calculateEstimatedReturns(
  strategy: string,
  investment: number,
  timeframe: "1m" | "3m" | "6m" | "1y",
): { conservative: number; realistic: number; optimistic: number } {
  const baseReturns = {
    dca: { conservative: 0.05, realistic: 0.12, optimistic: 0.18 },
    grid: { conservative: 0.08, realistic: 0.2, optimistic: 0.3 },
    scalping: { conservative: 0.1, realistic: 0.3, optimistic: 0.5 },
    momentum: { conservative: 0.12, realistic: 0.24, optimistic: 0.4 },
    arbitrage: { conservative: 0.03, realistic: 0.08, optimistic: 0.15 },
    "mean-reversion": { conservative: 0.06, realistic: 0.16, optimistic: 0.25 },
    "ai-adaptive": { conservative: 0.15, realistic: 0.35, optimistic: 0.55 },
    portfolio: { conservative: 0.04, realistic: 0.14, optimistic: 0.22 },
  };

  const timeMultiplier = {
    "1m": 1 / 12,
    "3m": 3 / 12,
    "6m": 6 / 12,
    "1y": 1,
  };

  const returns =
    baseReturns[strategy as keyof typeof baseReturns] || baseReturns.dca;
  const multiplier = timeMultiplier[timeframe];

  return {
    conservative:
      investment * (1 + returns.conservative * multiplier) - investment,
    realistic: investment * (1 + returns.realistic * multiplier) - investment,
    optimistic: investment * (1 + returns.optimistic * multiplier) - investment,
  };
}
