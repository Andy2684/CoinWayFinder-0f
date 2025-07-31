import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import type { User } from "@/types"

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      plan: user.plan || "free",
      isVerified: user.isVerified || false,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error finding user by email:", error)
    return null
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      plan: user.plan || "free",
      isVerified: user.isVerified || false,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error finding user by ID:", error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  username?: string
  firstName?: string
  lastName?: string
}): Promise<User> {
  try {
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user document
    const userDoc = {
      email: userData.email,
      password: hashedPassword,
      username: userData.username || userData.email.split("@")[0],
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      role: "user",
      plan: "free",
      isVerified: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("users").insertOne(userDoc)

    return {
      id: result.insertedId.toString(),
      email: userDoc.email,
      username: userDoc.username,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      role: userDoc.role,
      plan: userDoc.plan,
      isVerified: userDoc.isVerified,
      created_at: userDoc.created_at,
      updated_at: userDoc.updated_at,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const { ObjectId } = require("mongodb")

    const updateDoc = {
      ...updates,
      updated_at: new Date(),
    }

    // Remove id from updates if present
    delete updateDoc.id

    const result = await db
      .collection("users")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateDoc }, { returnDocument: "after" })

    if (!result.value) return null

    const user = result.value
    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      plan: user.plan,
      isVerified: user.isVerified,
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

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export async function getUserStats(): Promise<{
  total: number
  verified: number
  unverified: number
  byPlan: Record<string, number>
  byRole: Record<string, number>
}> {
  try {
    const { db } = await connectToDatabase()

    const [totalResult, verifiedResult, planStats, roleStats] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ isVerified: true }),
      db
        .collection("users")
        .aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("users")
        .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        .toArray(),
    ])

    const byPlan: Record<string, number> = {}
    planStats.forEach((stat) => {
      byPlan[stat._id || "unknown"] = stat.count
    })

    const byRole: Record<string, number> = {}
    roleStats.forEach((stat) => {
      byRole[stat._id || "unknown"] = stat.count
    })

    return {
      total: totalResult,
      verified: verifiedResult,
      unverified: totalResult - verifiedResult,
      byPlan,
      byRole,
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    return {
      total: 0,
      verified: 0,
      unverified: 0,
      byPlan: {},
      byRole: {},
    }
  }
}
