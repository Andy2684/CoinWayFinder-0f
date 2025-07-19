<<<<<<< HEAD
import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Re-export all database functions for compatibility
export * from "./database"
=======
import { neon } from '@neondatabase/serverless'
import { sql } from '@vercel/postgres'

export const db = neon(process.env.DATABASE_URL!)
export { sql }
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
