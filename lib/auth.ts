import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  subscriptionStatus: "free" | "starter" | "pro" | "enterprise"
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  token: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch (error) {
    return null
  }
}

// Create user
export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
}): Promise<User> {
  const passwordHash = await hashPassword(userData.password)
  const username = userData.username || `${userData.firstName.toLowerCase()}_${userData.lastName.toLowerCase()}`

  const [user] = await sql`
    INSERT INTO users (
      email, 
      password_hash, 
      first_name, 
      last_name, 
      username
    )
    VALUES (
      ${userData.email}, 
      ${passwordHash}, 
      ${userData.firstName}, 
      ${userData.lastName}, 
      ${username}
    )
    RETURNING 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
  `

  return user
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      password_hash, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE email = ${email}
  `

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password_hash)
  if (!isValidPassword) {
    return null
  }

  // Update last login
  await sql`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = ${user.id}
  `

  // Remove password_hash from returned user
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE id = ${userId}
  `

  return user || null
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql`
    SELECT 
      id, 
      email, 
      first_name as "firstName", 
      last_name as "lastName", 
      username, 
      role, 
      subscription_status as "subscriptionStatus", 
      is_email_verified as "isEmailVerified", 
      last_login as "lastLogin", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM users 
    WHERE email = ${email}
  `

  return user || null
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1 FROM users WHERE email = ${email}
  `
  return !!result
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1 FROM users WHERE username = ${username}
  `
  return !!result
}
