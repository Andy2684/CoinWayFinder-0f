// lib/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

// Берём URL из .env.local (обязательно должно быть DATABASE_URL)
const connectionString = process.env.DATABASE_URL!
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables")
}

// Создаём пул соединений с SSL для Neon
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  // При необходимости можно увеличить таймауты:
  // connectionTimeoutMillis: 20000,
  // statement_timeout: 20000,
})

export const db = drizzle(pool)
