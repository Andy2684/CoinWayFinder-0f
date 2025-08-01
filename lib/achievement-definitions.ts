import type { Achievement } from "@/types/achievements"

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Onboarding & Learning
  {
    id: "first_steps",
    title: "First Steps",
    description: "Complete your account setup and profile",
    category: "learning",
    type: "one_time",
    icon: "🚀",
    rarity: "common",
    points: 50,
    requirements: [{ type: "action", key: "profile_completed", target: 1, operator: "gte" }],
    reward: {
      type: "feature",
      value: "basic_analytics",
      description: "Unlock basic portfolio analytics",
    },
  },
  {
    id: "knowledge_seeker",
    title: "Knowledge Seeker",
    description: "Read your first 10 market analysis articles",
    category: "learning",
    type: "cumulative",
    icon: "📚",
    rarity: "common",
    points: 100,
    requirements: [{ type: "value", key: "articles_read", target: 10, operator: "gte" }],
    maxProgress: 10,
  },
  {
    id: "trading_scholar",
    title: "Trading Scholar",
    description: "Read 100 market analysis articles",
    category: "learning",
    type: "cumulative",
    icon: "🎓",
    rarity: "rare",
    points: 500,
    requirements: [{ type: "value", key: "articles_read", target: 100, operator: "gte" }],
    maxProgress: 100,
  },

  // Trading Achievements
  {
    id: "first_trade",
    title: "First Trade",
    description: "Execute your first successful trade",
    category: "trading",
    type: "one_time",
    icon: "💼",
    rarity: "common",
    points: 100,
    requirements: [{ type: "value", key: "trades_completed", target: 1, operator: "gte" }],
    reward: {
      type: "discount",
      value: "10",
      description: "10% discount on premium features for 1 month",
    },
  },
  {
    id: "trading_veteran",
    title: "Trading Veteran",
    description: "Complete 100 successful trades",
    category: "trading",
    type: "cumulative",
    icon: "⚔️",
    rarity: "rare",
    points: 1000,
    requirements: [{ type: "value", key: "trades_completed", target: 100, operator: "gte" }],
    maxProgress: 100,
    reward: {
      type: "feature",
      value: "advanced_analytics",
      description: "Unlock advanced trading analytics",
    },
  },
  {
    id: "profit_maker",
    title: "Profit Maker",
    description: "Generate $1,000 in total profits",
    category: "trading",
    type: "cumulative",
    icon: "💰",
    rarity: "uncommon",
    points: 300,
    requirements: [{ type: "value", key: "profit_generated", target: 1000, operator: "gte" }],
    maxProgress: 1000,
  },
  {
    id: "whale",
    title: "Whale",
    description: "Generate $100,000 in total profits",
    category: "trading",
    type: "cumulative",
    icon: "🐋",
    rarity: "legendary",
    points: 5000,
    requirements: [{ type: "value", key: "profit_generated", target: 100000, operator: "gte" }],
    maxProgress: 100000,
    reward: {
      type: "premium_trial",
      value: "90",
      description: "90 days of premium features",
    },
  },

  // Bot Achievements
  {
    id: "bot_master",
    title: "Bot Master",
    description: "Create your first trading bot",
    category: "bot",
    type: "one_time",
    icon: "🤖",
    rarity: "common",
    points: 150,
    requirements: [{ type: "value", key: "bots_created", target: 1, operator: "gte" }],
  },
  {
    id: "bot_army",
    title: "Bot Army",
    description: "Create and deploy 10 trading bots",
    category: "bot",
    type: "cumulative",
    icon: "🚀",
    rarity: "epic",
    points: 2000,
    requirements: [{ type: "value", key: "bots_created", target: 10, operator: "gte" }],
    maxProgress: 10,
  },

  // Streak Achievements
  {
    id: "daily_trader",
    title: "Daily Trader",
    description: "Login and check markets for 7 consecutive days",
    category: "streak",
    type: "streak",
    icon: "🔥",
    rarity: "uncommon",
    points: 200,
    requirements: [{ type: "streak", key: "login_streak", target: 7, operator: "gte" }],
  },
  {
    id: "market_devotee",
    title: "Market Devotee",
    description: "Login daily for 30 consecutive days",
    category: "streak",
    type: "streak",
    icon: "🌟",
    rarity: "rare",
    points: 750,
    requirements: [{ type: "streak", key: "login_streak", target: 30, operator: "gte" }],
  },
  {
    id: "crypto_legend",
    title: "Crypto Legend",
    description: "Login daily for 365 consecutive days",
    category: "streak",
    type: "streak",
    icon: "👑",
    rarity: "legendary",
    points: 10000,
    requirements: [{ type: "streak", key: "login_streak", target: 365, operator: "gte" }],
    reward: {
      type: "badge",
      value: "lifetime_legend",
      description: "Exclusive Lifetime Legend badge",
    },
  },

  // Social Achievements
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Refer 5 friends to CoinWayFinder",
    category: "social",
    type: "cumulative",
    icon: "🦋",
    rarity: "uncommon",
    points: 400,
    requirements: [{ type: "value", key: "referrals_made", target: 5, operator: "gte" }],
    maxProgress: 5,
  },

  // Milestone Achievements
  {
    id: "one_month",
    title: "One Month Strong",
    description: "Be an active member for 30 days",
    category: "milestone",
    type: "one_time",
    icon: "📅",
    rarity: "common",
    points: 250,
    requirements: [{ type: "value", key: "days_active", target: 30, operator: "gte" }],
  },
  {
    id: "one_year",
    title: "Anniversary",
    description: "Celebrate one year with CoinWayFinder",
    category: "milestone",
    type: "one_time",
    icon: "🎉",
    rarity: "epic",
    points: 2500,
    requirements: [{ type: "value", key: "days_active", target: 365, operator: "gte" }],
    reward: {
      type: "premium_trial",
      value: "30",
      description: "30 days of premium features",
    },
  },

  // Special Achievements
  {
    id: "beta_tester",
    title: "Beta Tester",
    description: "Early adopter who joined during beta",
    category: "special",
    type: "one_time",
    icon: "🧪",
    rarity: "legendary",
    points: 1000,
    requirements: [{ type: "action", key: "beta_user", target: 1, operator: "eq" }],
  },
  {
    id: "perfect_month",
    title: "Perfect Month",
    description: "Complete all daily activities for a full month",
    category: "special",
    type: "one_time",
    icon: "✨",
    rarity: "epic",
    points: 1500,
    requirements: [{ type: "action", key: "perfect_month", target: 1, operator: "gte" }],
  },
]

export const RARITY_COLORS = {
  common: "text-gray-400 border-gray-400",
  uncommon: "text-green-400 border-green-400",
  rare: "text-blue-400 border-blue-400",
  epic: "text-purple-400 border-purple-400",
  legendary: "text-yellow-400 border-yellow-400",
}

export const RARITY_GRADIENTS = {
  common: "from-gray-500 to-gray-600",
  uncommon: "from-green-500 to-green-600",
  rare: "from-blue-500 to-blue-600",
  epic: "from-purple-500 to-purple-600",
  legendary: "from-yellow-500 to-yellow-600",
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((achievement) => achievement.id === id)
}

export function getAchievementsByCategory(category: Achievement["category"]): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.filter((achievement) => achievement.category === category)
}

export function getAchievementsByRarity(rarity: Achievement["rarity"]): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.filter((achievement) => achievement.rarity === rarity)
}
