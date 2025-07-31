import { db } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  password?: string
  name?: string
  role: "user" | "admin"
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface CreateUserData {
  email: string
  password: string
  name?: string
  role?: "user" | "admin"
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: "user" | "admin"
  isActive?: boolean
  emailVerified?: boolean
}

export class UserService {
  async createUser(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await db.query(
      `INSERT INTO users (email, password, name, role, is_active, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, false, NOW(), NOW())
       RETURNING id, email, name, role, is_active as "isActive", email_verified as "emailVerified", created_at as "createdAt", updated_at as "updatedAt"`,
      [data.email, hashedPassword, data.name || null, data.role || "user"],
    )

    return user.rows[0]
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      `SELECT id, email, password, name, role, is_active as "isActive", 
              email_verified as "emailVerified", created_at as "createdAt", 
              updated_at as "updatedAt", last_login_at as "lastLoginAt"
       FROM users WHERE email = $1`,
      [email],
    )

    return result.rows[0] || null
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.query(
      `SELECT id, email, name, role, is_active as "isActive", 
              email_verified as "emailVerified", created_at as "createdAt", 
              updated_at as "updatedAt", last_login_at as "lastLoginAt"
       FROM users WHERE id = $1`,
      [id],
    )

    return result.rows[0] || null
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`)
      values.push(data.name)
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`)
      values.push(data.email)
    }
    if (data.role !== undefined) {
      fields.push(`role = $${paramCount++}`)
      values.push(data.role)
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`)
      values.push(data.isActive)
    }
    if (data.emailVerified !== undefined) {
      fields.push(`email_verified = $${paramCount++}`)
      values.push(data.emailVerified)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount}
       RETURNING id, email, name, role, is_active as "isActive", 
                email_verified as "emailVerified", created_at as "createdAt", 
                updated_at as "updatedAt", last_login_at as "lastLoginAt"`,
      values,
    )

    return result.rows[0] || null
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id])
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false
    return bcrypt.compare(password, user.password)
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.query("DELETE FROM users WHERE id = $1", [id])
    return result.rowCount > 0
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const result = await db.query(
      `SELECT id, email, name, role, is_active as "isActive", 
              email_verified as "emailVerified", created_at as "createdAt", 
              updated_at as "updatedAt", last_login_at as "lastLoginAt"
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    )

    return result.rows
  }

  async getUserCount(): Promise<number> {
    const result = await db.query("SELECT COUNT(*) as count FROM users")
    return Number.parseInt(result.rows[0].count)
  }
}

export const userService = new UserService()
