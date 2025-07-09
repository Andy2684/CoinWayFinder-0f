// Admin system with backdoor access for project.command.center@gmail.com

interface AdminUser {
  id: string
  username: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
}

interface AdminSession {
  userId: string
  username: string
  email: string
  isAdmin: boolean
  token: string
  expiresAt: number
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalBots: number
  activeBots: number
  totalTrades: number
  totalVolume: number
