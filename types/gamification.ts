export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "onboarding" | "trading" | "social" | "learning" | "milestone"
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: Date
  progress?: {
    current: number
    required: number
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: Date
  category: string
}

export interface UserProgress {
  userId: string
  totalPoints: number
  level: number
  currentLevelPoints: number
  nextLevelPoints: number
  achievements: Achievement[]
  badges: Badge[]
  streaks: {
    onboardingDays: number
    tradingDays: number
    learningDays: number
  }
  milestones: {
    profileCompleted: boolean
    firstTrade: boolean
    firstBot: boolean
    firstProfit: boolean
    communityJoined: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface Reward {
  id: string
  type: "points" | "badge" | "achievement" | "unlock"
  title: string
  description: string
  value: number | string
  icon: string
  animation: "bounce" | "pulse" | "glow" | "confetti"
}
