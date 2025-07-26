import { sql } from "./database"

export interface SecurityReport {
  id: string
  title: string
  generatedAt: Date
  period: {
    start: Date
    end: Date
    type: "daily" | "weekly" | "monthly"
  }
  summary: {
    totalEvents: number
    failedEvents: number
    successRate: number
    uniqueUsers: number
    uniqueIps: number
    criticalEvents: number
    highRiskEvents: number
  }
  trends: {
    eventTrend: "increasing" | "decreasing" | "stable"
    failureTrend: "increasing" | "decreasing" | "stable"
    userActivityTrend: "increasing" | "decreasing" | "stable"
    threatLevelTrend: "increasing" | "decreasing" | "stable"
  }
  insights: SecurityInsight[]
  recommendations: SecurityRecommendation[]
  charts: {
    eventsByDay: Array<{ date: string; events: number; failures: number }>
    eventsByCategory: Array<{ category: string; count: number; percentage: number }>
    topFailureReasons: Array<{ reason: string; count: number }>
    riskLevelDistribution: Array<{ level: string; count: number; percentage: number }>
    hourlyActivity: Array<{ hour: number; events: number }>
  }
  alerts: {
    critical: SecurityAlert[]
    high: SecurityAlert[]
    medium: SecurityAlert[]
  }
}

export interface SecurityInsight {
  type: "warning" | "info" | "success" | "critical"
  title: string
  description: string
  impact: "low" | "medium" | "high" | "critical"
  category: "authentication" | "authorization" | "system" | "security" | "performance"
  data?: Record<string, any>
}

export interface SecurityRecommendation {
  priority: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  action: string
  category: "security" | "performance" | "monitoring" | "compliance"
  estimatedEffort: "low" | "medium" | "high"
  expectedImpact: "low" | "medium" | "high"
}

export interface SecurityAlert {
  id: string
  timestamp: Date
  type: string
  description: string
  riskLevel: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

class SecurityReportGenerator {
  async generateReport(
    type: "daily" | "weekly" | "monthly",
    startDate?: Date,
    endDate?: Date,
  ): Promise<SecurityReport> {
    const period = this.calculatePeriod(type, startDate, endDate)
    const reportId = `${type}-${period.start.toISOString().split("T")[0]}-${Date.now()}`

    // Gather all data in parallel
    const [
      summary,
      eventsByDay,
      eventsByCategory,
      topFailureReasons,
      riskLevelDistribution,
      hourlyActivity,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
    ] = await Promise.all([
      this.generateSummary(period.start, period.end),
      this.getEventsByDay(period.start, period.end),
      this.getEventsByCategory(period.start, period.end),
      this.getTopFailureReasons(period.start, period.end),
      this.getRiskLevelDistribution(period.start, period.end),
      this.getHourlyActivity(period.start, period.end),
      this.getAlertsByRiskLevel(period.start, period.end, "critical"),
      this.getAlertsByRiskLevel(period.start, period.end, "high"),
      this.getAlertsByRiskLevel(period.start, period.end, "medium"),
    ])

    // Calculate trends
    const trends = await this.calculateTrends(period, type)

    // Generate insights
    const insights = this.generateInsights(summary, trends, eventsByCategory, topFailureReasons)

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, trends, insights)

    return {
      id: reportId,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Security Report`,
      generatedAt: new Date(),
      period,
      summary,
      trends,
      insights,
      recommendations,
      charts: {
        eventsByDay,
        eventsByCategory,
        topFailureReasons,
        riskLevelDistribution,
        hourlyActivity,
      },
      alerts: {
        critical: criticalAlerts,
        high: highAlerts,
        medium: mediumAlerts,
      },
    }
  }

  private calculatePeriod(type: "daily" | "weekly" | "monthly", startDate?: Date, endDate?: Date) {
    const now = new Date()
    let start: Date
    const end: Date = endDate || now

    if (startDate) {
      start = startDate
    } else {
      switch (type) {
        case "daily":
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case "weekly":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "monthly":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }
    }

    return { start, end, type }
  }

  private async generateSummary(startDate: Date, endDate: Date) {
    try {
      const [result] = await sql`
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN success = false THEN 1 END) as failed_events,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT ip_address) as unique_ips,
          COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_events,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_events
        FROM audit_logs
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      `

      const totalEvents = Number.parseInt(result.total_events) || 0
      const failedEvents = Number.parseInt(result.failed_events) || 0
      const successRate = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100

      return {
        totalEvents,
        failedEvents,
        successRate: Math.round(successRate * 100) / 100,
        uniqueUsers: Number.parseInt(result.unique_users) || 0,
        uniqueIps: Number.parseInt(result.unique_ips) || 0,
        criticalEvents: Number.parseInt(result.critical_events) || 0,
        highRiskEvents: Number.parseInt(result.high_risk_events) || 0,
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      return {
        totalEvents: 0,
        failedEvents: 0,
        successRate: 100,
        uniqueUsers: 0,
        uniqueIps: 0,
        criticalEvents: 0,
        highRiskEvents: 0,
      }
    }
  }

  private async getEventsByDay(startDate: Date, endDate: Date) {
    try {
      const results = await sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as events,
          COUNT(CASE WHEN success = false THEN 1 END) as failures
        FROM audit_logs
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `

      return results.map((row) => ({
        date: row.date,
        events: Number.parseInt(row.events),
        failures: Number.parseInt(row.failures),
      }))
    } catch (error) {
      console.error("Error getting events by day:", error)
      return []
    }
  }

  private async getEventsByCategory(startDate: Date, endDate: Date) {
    try {
      const results = await sql`
        SELECT 
          event_category as category,
          COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY event_category
        ORDER BY count DESC
      `

      const total = results.reduce((sum, row) => sum + Number.parseInt(row.count), 0)

      return results.map((row) => ({
        category: row.category,
        count: Number.parseInt(row.count),
        percentage: total > 0 ? Math.round((Number.parseInt(row.count) / total) * 100) : 0,
      }))
    } catch (error) {
      console.error("Error getting events by category:", error)
      return []
    }
  }

  private async getTopFailureReasons(startDate: Date, endDate: Date) {
    try {
      const results = await sql`
        SELECT 
          event_type as reason,
          COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= ${startDate} 
          AND created_at <= ${endDate}
          AND success = false
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 10
      `

      return results.map((row) => ({
        reason: row.reason,
        count: Number.parseInt(row.count),
      }))
    } catch (error) {
      console.error("Error getting top failure reasons:", error)
      return []
    }
  }

  private async getRiskLevelDistribution(startDate: Date, endDate: Date) {
    try {
      const results = await sql`
        SELECT 
          risk_level as level,
          COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY risk_level
        ORDER BY 
          CASE risk_level
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END
      `

      const total = results.reduce((sum, row) => sum + Number.parseInt(row.count), 0)

      return results.map((row) => ({
        level: row.level,
        count: Number.parseInt(row.count),
        percentage: total > 0 ? Math.round((Number.parseInt(row.count) / total) * 100) : 0,
      }))
    } catch (error) {
      console.error("Error getting risk level distribution:", error)
      return []
    }
  }

  private async getHourlyActivity(startDate: Date, endDate: Date) {
    try {
      const results = await sql`
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as events
        FROM audit_logs
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      `

      // Fill in missing hours with 0 events
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        events: 0,
      }))

      results.forEach((row) => {
        const hour = Number.parseInt(row.hour)
        if (hour >= 0 && hour < 24) {
          hourlyData[hour].events = Number.parseInt(row.events)
        }
      })

      return hourlyData
    } catch (error) {
      console.error("Error getting hourly activity:", error)
      return Array.from({ length: 24 }, (_, hour) => ({ hour, events: 0 }))
    }
  }

  private async getAlertsByRiskLevel(startDate: Date, endDate: Date, riskLevel: string): Promise<SecurityAlert[]> {
    try {
      const results = await sql`
        SELECT 
          id,
          created_at as timestamp,
          event_type as type,
          event_description as description,
          risk_level,
          user_id,
          ip_address,
          user_agent,
          metadata
        FROM audit_logs
        WHERE created_at >= ${startDate} 
          AND created_at <= ${endDate}
          AND risk_level = ${riskLevel}
        ORDER BY created_at DESC
        LIMIT 50
      `

      return results.map((row) => ({
        id: row.id,
        timestamp: new Date(row.timestamp),
        type: row.type,
        description: row.description,
        riskLevel: row.risk_level,
        userId: row.user_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        metadata: row.metadata,
      }))
    } catch (error) {
      console.error(`Error getting ${riskLevel} alerts:`, error)
      return []
    }
  }

  private async calculateTrends(period: any, type: string) {
    // Calculate previous period for comparison
    const periodLength = period.end.getTime() - period.start.getTime()
    const previousStart = new Date(period.start.getTime() - periodLength)
    const previousEnd = period.start

    const [currentSummary, previousSummary] = await Promise.all([
      this.generateSummary(period.start, period.end),
      this.generateSummary(previousStart, previousEnd),
    ])

    return {
      eventTrend: this.calculateTrend(currentSummary.totalEvents, previousSummary.totalEvents),
      failureTrend: this.calculateTrend(currentSummary.failedEvents, previousSummary.failedEvents),
      userActivityTrend: this.calculateTrend(currentSummary.uniqueUsers, previousSummary.uniqueUsers),
      threatLevelTrend: this.calculateTrend(
        currentSummary.criticalEvents + currentSummary.highRiskEvents,
        previousSummary.criticalEvents + previousSummary.highRiskEvents,
      ),
    }
  }

  private calculateTrend(current: number, previous: number): "increasing" | "decreasing" | "stable" {
    if (previous === 0) return current > 0 ? "increasing" : "stable"

    const changePercent = ((current - previous) / previous) * 100

    if (changePercent > 10) return "increasing"
    if (changePercent < -10) return "decreasing"
    return "stable"
  }

  private generateInsights(
    summary: any,
    trends: any,
    eventsByCategory: any[],
    topFailureReasons: any[],
  ): SecurityInsight[] {
    const insights: SecurityInsight[] = []

    // Success rate insight
    if (summary.successRate < 95) {
      insights.push({
        type: "warning",
        title: "Low Success Rate Detected",
        description: `System success rate is ${summary.successRate}%, which is below the recommended 95% threshold.`,
        impact: summary.successRate < 90 ? "high" : "medium",
        category: "performance",
        data: { successRate: summary.successRate, threshold: 95 },
      })
    } else if (summary.successRate > 99) {
      insights.push({
        type: "success",
        title: "Excellent System Performance",
        description: `System is performing exceptionally well with ${summary.successRate}% success rate.`,
        impact: "low",
        category: "performance",
        data: { successRate: summary.successRate },
      })
    }

    // Critical events insight
    if (summary.criticalEvents > 0) {
      insights.push({
        type: "critical",
        title: "Critical Security Events Detected",
        description: `${summary.criticalEvents} critical security events require immediate attention.`,
        impact: "critical",
        category: "security",
        data: { criticalEvents: summary.criticalEvents },
      })
    }

    // Trend insights
    if (trends.failureTrend === "increasing") {
      insights.push({
        type: "warning",
        title: "Increasing Failure Rate",
        description: "System failures are trending upward compared to the previous period.",
        impact: "medium",
        category: "performance",
      })
    }

    if (trends.threatLevelTrend === "increasing") {
      insights.push({
        type: "warning",
        title: "Escalating Security Threats",
        description: "High-risk security events are increasing compared to the previous period.",
        impact: "high",
        category: "security",
      })
    }

    // Authentication insights
    const authCategory = eventsByCategory.find((cat) => cat.category === "authentication")
    if (authCategory && authCategory.percentage > 50) {
      insights.push({
        type: "info",
        title: "High Authentication Activity",
        description: `Authentication events make up ${authCategory.percentage}% of all system events.`,
        impact: "low",
        category: "authentication",
        data: { percentage: authCategory.percentage },
      })
    }

    // Top failure insight
    if (topFailureReasons.length > 0) {
      const topFailure = topFailureReasons[0]
      insights.push({
        type: "info",
        title: "Most Common Failure Type",
        description: `"${topFailure.reason}" is the most common failure type with ${topFailure.count} occurrences.`,
        impact: "medium",
        category: "system",
        data: { failureType: topFailure.reason, count: topFailure.count },
      })
    }

    return insights
  }

  private generateRecommendations(summary: any, trends: any, insights: SecurityInsight[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = []

    // Critical events recommendations
    if (summary.criticalEvents > 0) {
      recommendations.push({
        priority: "critical",
        title: "Address Critical Security Events",
        description: "Investigate and resolve all critical security events immediately.",
        action: "Review critical event logs, identify root causes, and implement fixes.",
        category: "security",
        estimatedEffort: "high",
        expectedImpact: "high",
      })
    }

    // Success rate recommendations
    if (summary.successRate < 95) {
      recommendations.push({
        priority: summary.successRate < 90 ? "high" : "medium",
        title: "Improve System Reliability",
        description: "System success rate is below optimal levels.",
        action: "Analyze failure patterns, improve error handling, and enhance system monitoring.",
        category: "performance",
        estimatedEffort: "medium",
        expectedImpact: "high",
      })
    }

    // Trend-based recommendations
    if (trends.failureTrend === "increasing") {
      recommendations.push({
        priority: "medium",
        title: "Address Increasing Failure Rate",
        description: "System failures are trending upward.",
        action: "Implement proactive monitoring and alerting for early failure detection.",
        category: "monitoring",
        estimatedEffort: "medium",
        expectedImpact: "medium",
      })
    }

    if (trends.threatLevelTrend === "increasing") {
      recommendations.push({
        priority: "high",
        title: "Strengthen Security Measures",
        description: "Security threats are escalating.",
        action:
          "Review and enhance security policies, implement additional monitoring, and consider security training.",
        category: "security",
        estimatedEffort: "high",
        expectedImpact: "high",
      })
    }

    // General recommendations
    if (summary.uniqueIps > summary.uniqueUsers * 3) {
      recommendations.push({
        priority: "medium",
        title: "Review IP Access Patterns",
        description: "High ratio of unique IPs to users may indicate suspicious activity.",
        action: "Implement IP-based monitoring and consider geographic access restrictions.",
        category: "security",
        estimatedEffort: "low",
        expectedImpact: "medium",
      })
    }

    // Monitoring recommendations
    recommendations.push({
      priority: "low",
      title: "Enhance Security Monitoring",
      description: "Continuous improvement of security monitoring capabilities.",
      action: "Implement automated threat detection, enhance logging, and improve alert mechanisms.",
      category: "monitoring",
      estimatedEffort: "medium",
      expectedImpact: "medium",
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

export const securityReportGenerator = new SecurityReportGenerator()
