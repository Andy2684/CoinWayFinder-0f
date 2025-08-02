import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"

export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  role: "user" | "admin"
  plan: "free" | "starter" | "pro" | "enterprise"
  isEmailVerified: boolean
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
    dateOfBirth?: Date
  }
  settings?: {
    notifications: boolean
    theme: "light" | "dark"
    language: string
  }
  onboarding?: {
    completed: boolean
    currentStep: number
    completedSteps: string[]
  }
  achievements?: string[]
  tradingPreferences?: {
    riskTolerance: "low" | "medium" | "high"
    tradingExperience: "beginner" | "intermediate" | "advanced"
    preferredAssets: string[]
    maxInvestmentAmount?: number
  }
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  email: string
  username: string
  password: string
  profile?: {
    firstName?: string
    lastName?: string
  }
  isEmailVerified?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const { db } = await connectToDatabase()

  const passwordHash = await hashPassword(userData.password)

  const newUser = {
    email: userData.email.toLowerCase().trim(),
    username: userData.username.toLowerCase().trim(),
    passwordHash,
    role: "user" as const,
    plan: "free" as const,
    isEmailVerified: userData.isEmailVerified || false,
    profile: userData.profile || {},
    settings: {
      notifications: true,
      theme: "dark" as const,
      language: "en",
    },
    onboarding: {
      completed: false,
      currentStep: 0,
      completedSteps: [],
    },
    achievements: [],
    tradingPreferences: {
      riskTolerance: "medium" as const,
      tradingExperience: "beginner" as const,
      preferredAssets: [],
      maxInvestmentAmount: null,
    },
    created_at: new Date(),
    updated_at: new Date(),
  }

  const result = await db.collection("users").insertOne(newUser)

  return {
    id: result.insertedId.toString(),
    ...newUser,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      settings: user.settings,
      onboarding: user.onboarding,
      achievements: user.achievements,
      tradingPreferences: user.tradingPreferences,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const user = await db.collection("users").findOne({
      _id: new ObjectId(id),
    })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      settings: user.settings,
      onboarding: user.onboarding,
      achievements: user.achievements,
      tradingPreferences: user.tradingPreferences,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return null
    }

    const user = result.value
    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      settings: user.settings,
      onboarding: user.onboarding,
      achievements: user.achievements,
      tradingPreferences: user.tradingPreferences,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(id),
    })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}
