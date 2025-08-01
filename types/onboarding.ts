export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isCompleted: boolean
  isRequired: boolean
}

export interface UserOnboardingData {
  userId: string
  currentStep: number
  completedSteps: string[]
  profile: {
    firstName: string
    lastName: string
    dateOfBirth?: string
    country?: string
    phoneNumber?: string
    avatar?: string
  }
  tradingExperience: {
    level: "beginner" | "intermediate" | "advanced"
    yearsExperience: number
    previousPlatforms: string[]
    tradingGoals: string[]
    riskTolerance: "low" | "medium" | "high"
  }
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    theme: "light" | "dark"
    language: string
    timezone: string
  }
  exchanges: {
    connectedExchanges: string[]
    apiKeys: {
      exchange: string
      isConnected: boolean
      permissions: string[]
    }[]
  }
  verification: {
    emailVerified: boolean
    phoneVerified: boolean
    identityVerified: boolean
  }
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OnboardingProgress {
  totalSteps: number
  completedSteps: number
  currentStep: number
  percentComplete: number
}
