import { connectToDatabase } from "./mongodb"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  username: string
  password: string
  role: string
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      password: user.password,
      role: user.role || "user",
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    await db.collection("users").updateOne({ _id: userId }, { $set: { last_login: new Date() } })
  } catch (error) {
    console.error("Error updating last login:", error)
  }
}
