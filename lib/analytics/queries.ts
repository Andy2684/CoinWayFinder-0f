import { db } from "@/lib/db"
import { users, signals, bots, botTrades, news, alertRules } from "@/lib/db/schema"
import { eq, and, gte, lte, count, sum, avg, desc, asc, sql } from "drizzle-orm"

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  userGrowthRate: number
  usersByPlan: Array<{ plan: string; count: number }>
  usersByRole: Array<{ role: string; count: number }>
  verificationRate: number
}

export interface TradingAnalytics {
  totalSignals: number
  activeSignals: number
  signalSuccessRate: number
  totalBots: number
  activeBots: number
  totalTrades: number
  totalVolume: string
  averagePnL: string
  topPerformingStrategies: Array<{ strategy: string; avgPnL: string; count: number }>
  exchangeDistribution: Array<{ exchange: string; count: number }>
}

export interface EngagementAnalytics {
  dailyActiveUsers: Array<{ date: string; count: number }>
  signalCreationTrend: Array<{ date: string; count: number }>
  botCreationTrend: Array<{ date: string; count: number }>
  newsEngagement: Array<{ category: string; views: number }>
  alertsTriggered: number
  averageSessionDuration: number
}

export interface RevenueAnalytics {
  totalRevenue: string
  monthlyRecurringRevenue: string
  averageRevenuePerUser: string
  churnRate: number
  lifetimeValue: string
  conversionRate: number
  revenueByPlan: Array<{ plan: string; revenue: string; users: number }>
}

// User Analytics Queries
export async function getUserAnalytics(dateRange: DateRange): Promise<UserAnalytics> {
  const { startDate, endDate } = dateRange

  // Total users
  const totalUsersResult = await db.select({ count: count() }).from(users)
  const totalUsers = totalUsersResult[0].count

  // Active users (logged in within date range)
  const activeUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(and(gte(users.lastLoginAt, startDate), lte(users.lastLoginAt, endDate)))
  const activeUsers = activeUsersResult[0].count

  // New users in date range
  const newUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate)))
  const newUsers = newUsersResult[0].count

  // Previous period for growth rate calculation
  const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
  const previousNewUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(and(gte(users.createdAt, previousPeriodStart), lte(users.createdAt, startDate)))
  const previousNewUsers = previousNewUsersResult[0].count

  const userGrowthRate = previousNewUsers > 0 ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 : 0

  // Users by plan
  const usersByPlanResult = await db
    .select({
      plan: users.plan,
      count: count(),
    })
    .from(users)
    .groupBy(users.plan)
    .orderBy(desc(count()))

  // Users by role
  const usersByRoleResult = await db
    .select({
      role: users.role,
      count: count(),
    })
    .from(users)
    .groupBy(users.role)
    .orderBy(desc(count()))

  // Verification rate
  const verifiedUsersResult = await db.select({ count: count() }).from(users).where(eq(users.isVerified, true))
  const verificationRate = totalUsers > 0 ? (verifiedUsersResult[0].count / totalUsers) * 100 : 0

  return {
    totalUsers,
    activeUsers,
    newUsers,
    userGrowthRate,
    usersByPlan: usersByPlanResult,
    usersByRole: usersByRoleResult,
    verificationRate,
  }
}

// Trading Analytics Queries
export async function getTradingAnalytics(dateRange: DateRange): Promise<TradingAnalytics> {
  const { startDate, endDate } = dateRange

  // Total signals
  const totalSignalsResult = await db.select({ count: count() }).from(signals)
  const totalSignals = totalSignalsResult[0].count

  // Active signals
  const activeSignalsResult = await db.select({ count: count() }).from(signals).where(eq(signals.status, "ACTIVE"))
  const activeSignals = activeSignalsResult[0].count

  // Signal success rate (completed signals with positive PnL)
  const completedSignalsResult = await db
    .select({ count: count() })
    .from(signals)
    .where(eq(signals.status, "COMPLETED"))

  const successfulSignalsResult = await db
    .select({ count: count() })
    .from(signals)
    .where(and(eq(signals.status, "COMPLETED"), sql`${signals.pnl} > 0`))

  const signalSuccessRate =
    completedSignalsResult[0].count > 0 ? (successfulSignalsResult[0].count / completedSignalsResult[0].count) * 100 : 0

  // Total bots
  const totalBotsResult = await db.select({ count: count() }).from(bots)
  const totalBots = totalBotsResult[0].count

  // Active bots
  const activeBotsResult = await db.select({ count: count() }).from(bots).where(eq(bots.status, "ACTIVE"))
  const activeBots = activeBotsResult[0].count

  // Total trades
  const totalTradesResult = await db.select({ count: count() }).from(botTrades)
  const totalTrades = totalTradesResult[0].count

  // Total volume
  const totalVolumeResult = await db
    .select({
      volume: sum(sql`${botTrades.quantity} * ${botTrades.price}`),
    })
    .from(botTrades)
  const totalVolume = totalVolumeResult[0].volume || "0"

  // Average PnL
  const averagePnLResult = await db
    .select({
      avgPnL: avg(botTrades.pnl),
    })
    .from(botTrades)
  const averagePnL = averagePnLResult[0].avgPnL || "0"

  // Top performing strategies
  const topStrategiesResult = await db
    .select({
      strategy: bots.strategy,
      avgPnL: avg(bots.profit),
      count: count(),
    })
    .from(bots)
    .groupBy(bots.strategy)
    .orderBy(desc(avg(bots.profit)))
    .limit(5)

  // Exchange distribution
  const exchangeDistributionResult = await db
    .select({
      exchange: bots.exchange,
      count: count(),
    })
    .from(bots)
    .groupBy(bots.exchange)
    .orderBy(desc(count()))

  return {
    totalSignals,
    activeSignals,
    signalSuccessRate,
    totalBots,
    activeBots,
    totalTrades,
    totalVolume,
    averagePnL,
    topPerformingStrategies: topStrategiesResult,
    exchangeDistribution: exchangeDistributionResult,
  }
}

// Engagement Analytics Queries
export async function getEngagementAnalytics(dateRange: DateRange): Promise<EngagementAnalytics> {
  const { startDate, endDate } = dateRange

  // Daily active users
  const dailyActiveUsersResult = await db
    .select({
      date: sql<string>`DATE(${users.lastLoginAt})`,
      count: count(),
    })
    .from(users)
    .where(and(gte(users.lastLoginAt, startDate), lte(users.lastLoginAt, endDate)))
    .groupBy(sql`DATE(${users.lastLoginAt})`)
    .orderBy(asc(sql`DATE(${users.lastLoginAt})`))

  // Signal creation trend
  const signalCreationTrendResult = await db
    .select({
      date: sql<string>`DATE(${signals.createdAt})`,
      count: count(),
    })
    .from(signals)
    .where(and(gte(signals.createdAt, startDate), lte(signals.createdAt, endDate)))
    .groupBy(sql`DATE(${signals.createdAt})`)
    .orderBy(asc(sql`DATE(${signals.createdAt})`))

  // Bot creation trend
  const botCreationTrendResult = await db
    .select({
      date: sql<string>`DATE(${bots.createdAt})`,
      count: count(),
    })
    .from(bots)
    .where(and(gte(bots.createdAt, startDate), lte(bots.createdAt, endDate)))
    .groupBy(sql`DATE(${bots.createdAt})`)
    .orderBy(asc(sql`DATE(${bots.createdAt})`))

  // News engagement by category
  const newsEngagementResult = await db
    .select({
      category: news.category,
      views: count(),
    })
    .from(news)
    .where(and(gte(news.createdAt, startDate), lte(news.createdAt, endDate)))
    .groupBy(news.category)
    .orderBy(desc(count()))

  // Alerts triggered
  const alertsTriggeredResult = await db
    .select({ count: count() })
    .from(alertRules)
    .where(and(gte(alertRules.triggeredAt, startDate), lte(alertRules.triggeredAt, endDate)))
  const alertsTriggered = alertsTriggeredResult[0].count

  return {
    dailyActiveUsers: dailyActiveUsersResult,
    signalCreationTrend: signalCreationTrendResult,
    botCreationTrend: botCreationTrendResult,
    newsEngagement: newsEngagementResult,
    alertsTriggered,
    averageSessionDuration: 0, // Would need session tracking
  }
}

// Revenue Analytics Queries (mock implementation)
export async function getRevenueAnalytics(dateRange: DateRange): Promise<RevenueAnalytics> {
  // Plan pricing (would come from your pricing config)
  const planPricing = {
    free: 0,
    starter: 29,
    pro: 99,
    enterprise: 299,
  }

  // Users by plan
  const usersByPlanResult = await db
    .select({
      plan: users.plan,
      count: count(),
    })
    .from(users)
    .where(eq(users.isActive, true))
    .groupBy(users.plan)

  // Calculate revenue
  let totalRevenue = 0
  const revenueByPlan = usersByPlanResult.map(({ plan, count }) => {
    const planRevenue = (planPricing[plan as keyof typeof planPricing] || 0) * count
    totalRevenue += planRevenue
    return {
      plan,
      revenue: planRevenue.toString(),
      users: count,
    }
  })

  const totalUsersResult = await db.select({ count: count() }).from(users)
  const totalUsers = totalUsersResult[0].count

  const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0

  return {
    totalRevenue: totalRevenue.toString(),
    monthlyRecurringRevenue: totalRevenue.toString(),
    averageRevenuePerUser: averageRevenuePerUser.toString(),
    churnRate: 5.2, // Mock data
    lifetimeValue: (averageRevenuePerUser * 12).toString(),
    conversionRate: 15.8, // Mock data
    revenueByPlan,
  }
}

// Cohort Analysis
export async function getCohortAnalysis(startDate: Date, endDate: Date) {
  const cohortData = await db
    .select({
      cohortMonth: sql<string>`DATE_TRUNC('month', ${users.createdAt})`,
      periodNumber: sql<number>`EXTRACT(MONTH FROM AGE(${users.lastLoginAt}, ${users.createdAt}))`,
      userCount: count(),
    })
    .from(users)
    .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate), sql`${users.lastLoginAt} IS NOT NULL`))
    .groupBy(
      sql`DATE_TRUNC('month', ${users.createdAt})`,
      sql`EXTRACT(MONTH FROM AGE(${users.lastLoginAt}, ${users.createdAt}))`,
    )
    .orderBy(
      asc(sql`DATE_TRUNC('month', ${users.createdAt})`),
      asc(sql`EXTRACT(MONTH FROM AGE(${users.lastLoginAt}, ${users.createdAt}))`),
    )

  return cohortData
}

// Performance Metrics
export async function getPerformanceMetrics(dateRange: DateRange) {
  const { startDate, endDate } = dateRange

  // Top performing users by profit
  const topUsersResult = await db
    .select({
      userId: bots.userId,
      totalProfit: sum(bots.profit),
      totalTrades: sum(bots.totalTrades),
      avgWinRate: avg(bots.winRate),
    })
    .from(bots)
    .where(and(gte(bots.createdAt, startDate), lte(bots.createdAt, endDate)))
    .groupBy(bots.userId)
    .orderBy(desc(sum(bots.profit)))
    .limit(10)

  // Risk metrics
  const riskMetricsResult = await db
    .select({
      avgMaxDrawdown: avg(bots.maxDrawdown),
      avgSharpeRatio: avg(bots.sharpeRatio),
      totalRiskExposure: sum(sql`CAST(${bots.config}->>'amount' AS DECIMAL)`),
    })
    .from(bots)
    .where(eq(bots.status, "ACTIVE"))

  return {
    topUsers: topUsersResult,
    riskMetrics: riskMetricsResult[0],
  }
}
