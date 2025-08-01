import type { Achievement } from "@/types/achievements"

export const ACHIEVEMENTS: Achievement[] = [
  // Trading Achievements
  {
    id: "first-trade",
    name: "First Steps",
    description: "Complete your first trade",
    category: "trading",
    type: "one-time",
    rarity: "common",
    icon: "🎯",
    points: 10,
    requirements: {
      type: "stat",
      statKey: "totalTrades",
      value: 1,
      operator: "gte",
    },
    rewards: [
      {
        type: "feature",
        value: "advanced-charts",
        description: "Unlock advanced charting tools",
      },
    ],
  },
  {
    id: "profitable-trader",
    name: "In the Green",
    description: "Achieve your first $100 in profits",
    category: "trading",
    type: "one-time",
    rarity: "uncommon",
    icon: "💰",
    points: 25,
    requirements: {
      type: "stat",
      statKey: "totalProfit",
      value: 100,
      operator: "gte",
    },
    rewards: [
      {
        type: "discount",
        value: "10",
        description: "10% discount on premium features",
      },
    ],
  },
  {
    id: "high-roller",
    name: "High Roller",
    description: "Trade over $10,000 in volume",
    category: "trading",
    type: "cumulative",
    rarity: "rare",
    icon: "🎰",
    points: 50,
    requirements: {
      type: "stat",
      statKey: "totalVolume",
      value: 10000,
      operator: "gte",
    },
  },
  {
    id: "master-trader",
    name: "Master Trader",
    description: "Achieve 80% win rate with 50+ trades",
    category: "trading",
    type: "one-time",
    rarity: "epic",
    icon: "👑",
    points: 100,
    requirements: {
      type: "condition",
      conditions: ["winRate >= 0.8", "totalTrades >= 50"],
    },
    rewards: [
      {
        type: "premium",
        value: "30",
        description: "30 days of premium features",
      },
    ],
  },
  {
    id: "legendary-profit",
    name: "Profit Legend",
    description: "Earn $10,000+ in total profits",
    category: "trading",
    type: "cumulative",
    rarity: "legendary",
    icon: "🏆",
    points: 250,
    requirements: {
      type: "stat",
      statKey: "totalProfit",
      value: 10000,
      operator: "gte",
    },
    rewards: [
      {
        type: "badge",
        value: "legendary-trader",
        description: "Exclusive Legendary Trader badge",
      },
    ],
  },

  // Learning Achievements
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Read your first 5 articles",
    category: "learning",
    type: "progressive",
    rarity: "common",
    icon: "📚",
    points: 10,
    requirements: {
      type: "stat",
      statKey: "articlesRead",
      value: 5,
      operator: "gte",
    },
  },
  {
    id: "dedicated-learner",
    name: "Dedicated Learner",
    description: "Complete your first course",
    category: "learning",
    type: "one-time",
    rarity: "uncommon",
    icon: "🎓",
    points: 25,
    requirements: {
      type: "stat",
      statKey: "coursesCompleted",
      value: 1,
      operator: "gte",
    },
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Read 50 articles",
    category: "learning",
    type: "progressive",
    rarity: "rare",
    icon: "🔬",
    points: 50,
    requirements: {
      type: "stat",
      statKey: "articlesRead",
      value: 50,
      operator: "gte",
    },
  },

  // Social Achievements
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Refer your first friend",
    category: "social",
    type: "one-time",
    rarity: "uncommon",
    icon: "🦋",
    points: 25,
    requirements: {
      type: "stat",
      statKey: "referrals",
      value: 1,
      operator: "gte",
    },
    rewards: [
      {
        type: "points",
        value: 50,
        description: "Bonus 50 XP points",
      },
    ],
  },
  {
    id: "community-leader",
    name: "Community Leader",
    description: "Get 100 helpful votes on your posts",
    category: "social",
    type: "cumulative",
    rarity: "epic",
    icon: "🌟",
    points: 100,
    requirements: {
      type: "stat",
      statKey: "helpfulVotes",
      value: 100,
      operator: "gte",
    },
  },

  // Portfolio Achievements
  {
    id: "diversified-investor",
    name: "Diversified Investor",
    description: "Own 10 different assets",
    category: "portfolio",
    type: "progressive",
    rarity: "uncommon",
    icon: "📊",
    points: 25,
    requirements: {
      type: "stat",
      statKey: "assetsOwned",
      value: 10,
      operator: "gte",
    },
  },
  {
    id: "portfolio-millionaire",
    name: "Portfolio Millionaire",
    description: "Reach $1,000,000 portfolio value",
    category: "portfolio",
    type: "one-time",
    rarity: "legendary",
    icon: "💎",
    points: 250,
    requirements: {
      type: "stat",
      statKey: "portfolioValue",
      value: 1000000,
      operator: "gte",
    },
  },

  // Bot Achievements
  {
    id: "bot-creator",
    name: "Bot Creator",
    description: "Create your first trading bot",
    category: "bot",
    type: "one-time",
    rarity: "uncommon",
    icon: "🤖",
    points: 25,
    requirements: {
      type: "stat",
      statKey: "botsCreated",
      value: 1,
      operator: "gte",
    },
  },
  {
    id: "bot-master",
    name: "Bot Master",
    description: "Deploy 5 profitable bots",
    category: "bot",
    type: "progressive",
    rarity: "rare",
    icon: "🎛️",
    points: 50,
    requirements: {
      type: "stat",
      statKey: "botsDeployed",
      value: 5,
      operator: "gte",
    },
  },

  // Streak Achievements
  {
    id: "consistent-trader",
    name: "Consistent Trader",
    description: "Login for 7 days straight",
    category: "streak",
    type: "streak",
    rarity: "common",
    icon: "🔥",
    points: 10,
    requirements: {
      type: "streak",
      streakDays: 7,
    },
  },
  {
    id: "dedication-master",
    name: "Dedication Master",
    description: "Login for 30 days straight",
    category: "streak",
    type: "streak",
    rarity: "rare",
    icon: "⚡",
    points: 50,
    requirements: {
      type: "streak",
      streakDays: 30,
    },
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Login for 100 days straight",
    category: "streak",
    type: "streak",
    rarity: "legendary",
    icon: "🌟",
    points: 250,
    requirements: {
      type: "streak",
      streakDays: 100,
    },
  },

  // Milestone Achievements
  {
    id: "one-month-member",
    name: "One Month Strong",
    description: "Be a member for 30 days",
    category: "milestone",
    type: "one-time",
    rarity: "common",
    icon: "📅",
    points: 10,
    requirements: {
      type: "stat",
      statKey: "accountAge",
      value: 30,
      operator: "gte",
    },
  },
  {
    id: "one-year-veteran",
    name: "Veteran Trader",
    description: "Be a member for 365 days",
    category: "milestone",
    type: "one-time",
    rarity: "epic",
    icon: "🎖️",
    points: 100,
    requirements: {
      type: "stat",
      statKey: "accountAge",
      value: 365,
      operator: "gte",
    },
  },

  // Special Achievements
  {
    id: "beta-tester",
    name: "Beta Tester",
    description: "Participated in the beta program",
    category: "special",
    type: "one-time",
    rarity: "rare",
    icon: "🧪",
    points: 50,
    requirements: {
      type: "stat",
      statKey: "betaTester",
      value: 1,
      operator: "eq",
    },
    isHidden: true,
  },
  {
    id: "perfect-month",
    name: "Perfect Month",
    description: "Have a profitable month with no losing trades",
    category: "special",
    type: "one-time",
    rarity: "epic",
    icon: "✨",
    points: 100,
    requirements: {
      type: "stat",
      statKey: "perfectMonths",
      value: 1,
      operator: "gte",
    },
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Joined in the first 1000 users",
    category: "special",
    type: "one-time",
    rarity: "legendary",
    icon: "🚀",
    points: 250,
    requirements: {
      type: "stat",
      statKey: "earlyAdopter",
      value: 1,
      operator: "eq",
    },
    isHidden: true,
  },
]

export const RARITY_CONFIG = {
  common: {
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    points: 10,
  },
  uncommon: {
    color: "text-green-400",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    points: 25,
  },
  rare: {
    color: "text-blue-400",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    points: 50,
  },
  epic: {
    color: "text-purple-400",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    points: 100,
  },
  legendary: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    points: 250,
  },
}

export const POINTS_PER_LEVEL = 1000

export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / POINTS_PER_LEVEL) + 1
}

export function getPointsForNextLevel(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints)
  return currentLevel * POINTS_PER_LEVEL
}

export function getCurrentLevelProgress(totalPoints: number): number {
  const pointsInCurrentLevel = totalPoints % POINTS_PER_LEVEL
  return (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100
}
