export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  type: AchievementType
  rarity: AchievementRarity
  icon: string
  points: number
  requirements: AchievementRequirement
  rewards?: AchievementReward[]
  isHidden?: boolean
  prerequisiteIds?: string[]
}

export interface UserAchievement {
  achievementId: string
  userId: string
  unlockedAt: Date
  progress: number
  maxProgress: number
  isCompleted: boolean
  isClaimed: boolean
  claimedAt?: Date
  currentStreak?: number
  bestStreak?: number
}

export interface AchievementProgress {
  userId: string
  statistics: UserStatistics
  level: number
  totalPoints: number
  nextLevelPoints: number
  currentLevelProgress: number
}

export interface UserStatistics {
  // Trading stats
  totalTrades: number
  totalProfit: number
  totalVolume: number
  winRate: number
  bestTrade: number

  // Learning stats
  articlesRead: number
  coursesCompleted: number
  timeSpentLearning: number

  // Social stats
  referrals: number
  communityPosts: number
  helpfulVotes: number

  // Portfolio stats
  portfolioValue: number
  assetsOwned: number
  diversificationScore: number

  // Bot stats
  botsCreated: number
  botsDeployed: number
  botProfit: number

  // Engagement stats
  loginStreak: number
  bestLoginStreak: number
  daysActive: number
  accountAge: number

  // Special stats
  perfectMonths: number
  betaTester: boolean
  earlyAdopter: boolean
}

export type AchievementCategory =
  | "trading"
  | "learning"
  | "social"
  | "portfolio"
  | "bot"
  | "milestone"
  | "streak"
  | "special"

export type AchievementType =
  | "one-time" // Single unlock
  | "progressive" // Progress towards goal
  | "cumulative" // Accumulate over time
  | "streak" // Maintain consistency

export type AchievementRarity =
  | "common" // 10 points
  | "uncommon" // 25 points
  | "rare" // 50 points
  | "epic" // 100 points
  | "legendary" // 250 points

export interface AchievementRequirement {
  type: "stat" | "condition" | "streak" | "time"
  statKey?: keyof UserStatistics
  value?: number
  operator?: "gte" | "lte" | "eq" | "gt" | "lt"
  conditions?: string[]
  streakDays?: number
  timeframe?: "daily" | "weekly" | "monthly" | "yearly"
}

export interface AchievementReward {
  type: "points" | "feature" | "discount" | "badge" | "premium"
  value: string | number
  description: string
  duration?: number // in days
}

export interface AchievementNotification {
  id: string
  achievementId: string
  userId: string
  type: "unlock" | "progress" | "streak"
  message: string
  isRead: boolean
  createdAt: Date
}
