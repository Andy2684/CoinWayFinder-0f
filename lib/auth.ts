import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { database } from "./database"

export interface User {
  _id?: string
  email: string
  password?: string
  name: string
  avatar?: string
  role: "user" | "admin"
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    role: string
  }
  expires: string
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export class AuthManager {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return null
    }
  }

  static async createUser(userData: {
    email: string
    password: string
    name: string
  }): Promise<{ user: User; token: string }> {
    await database.connect()
    const collection = database.db!.collection<User>("users")

    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password)

    // Create user
    const user: Omit<User, "_id"> = {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: "user",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(user)
    const userId = result.insertedId.toString()

    // Create user settings with trial
    await database.createUserWithTrial(userId)

    // Generate token
    const token = this.generateToken(userId)

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return {
      user: { ...userWithoutPassword, _id: userId },
      token,
    }
  }

  static async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    await database.connect()
    const collection = database.db!.collection<User>("users")

    // Find user
    const user = await collection.findOne({ email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.password!)
    if (!isValid) {
      throw new Error("Invalid credentials")
    }

    // Generate token
    const token = this.generateToken(user._id!.toString())

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      token,
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    await database.connect()
    const collection = database.db!.collection<User>("users")

    const user = await collection.findOne({ _id: new database.ObjectId(userId) })
    if (!user) return null

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    await database.connect()
    const collection = database.db!.collection<User>("users")

    const result = await collection.updateOne(
      { _id: new database.ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } },
    )

    return result.modifiedCount > 0
  }
}
