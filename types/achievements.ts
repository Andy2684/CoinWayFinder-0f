export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  type: AchievementType
  icon: string
  rarity: AchievementRarity
  points: number
  requirements: AchievementRequirement[]
  reward?: AchievementReward
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
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

export type AchievementType = "one_time" | "progressive" | "streak" | "cumulative"

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary"

export interface AchievementRequirement {
  type: "action" | "value" | "streak" | "time"
  key: string
  target: number
  operator: "eq" | "gte" | "lte" | "gt" | "lt"
}

export interface AchievementReward {
  type: "points" | "badge" | "feature" | "discount" | "premium_trial"
  value: string | number
  description: string
}

export interface UserAchievement {
  achievementId: string
  userId: string
  unlockedAt: Date
  progress: number
  claimed: boolean
  claimedAt?: Date
}

export interface AchievementProgress {
  userId: string
  totalPoints: number
  totalAchievements: number
  level: number
  nextLevelPoints: number
  currentLevelPoints: number
  streak: {
    login: number
    trading: number
    learning: number
  }
  stats: {
    tradesCompleted: number
    botsCreated: number
    profitGenerated: number
    coursesCompleted: number
    articlesRead: number
    referralsMade: number
    daysActive: number
  }
}
