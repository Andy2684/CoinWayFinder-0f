import { connectToDatabase } from "./mongodb"

export type EventCategory =
  | "authentication"
  | "authorization"
  | "user_management"
  | "data_access"
  | "system"
  | "security"
  | "trading"
  | "api"

export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface AuditLogEntry {
  userId?: string | null
  eventType: string
  eventCategory: string
  eventDescription: string
  ipAddress?: string
  userAgent?: string
  riskLevel?: "low" | "medium" | "high"
  success?: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface AuditLogFilter {
  userId?: string
  eventCategory?: EventCategory
  eventType?: string
  riskLevel?: RiskLevel
  success?: boolean
  startDate?: Date
  endDate?: Date
  ipAddress?: string
  limit?: number
  offset?: number
}

class AuditLogger {
  private requestId = ""

  private constructor() {}

  public setRequestId(requestId: string) {
    this.requestId = requestId
  }

  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { db } = await connectToDatabase()

      const auditLog = {
        user_id: entry.userId || null,
        event_type: entry.eventType,
        event_category: entry.eventCategory,
        event_description: entry.eventDescription,
        ip_address: this.validateIpAddress(entry.ipAddress),
        user_agent: entry.userAgent || "",
        session_id: null,
        request_id: this.requestId || null,
        metadata: entry.metadata || {},
        risk_level: entry.riskLevel || "low",
        success: entry.success !== false,
        error_message: entry.errorMessage || null,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
      }

      await db.collection("audit_logs").insertOne(auditLog)
    } catch (error) {
      console.error("Failed to write audit log:", error)
      // Don't throw error to avoid breaking the main application flow
    }
  }

  // Authentication Events
  public async logLoginAttempt(
    userId: string | null,
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: success ? "login_success" : "login_failure",
      eventCategory: "authentication",
      eventDescription: success ? `Successful login for ${email}` : `Failed login attempt for ${email}`,
      ipAddress,
      userAgent,
      riskLevel: success ? "low" : "medium",
      success,
      errorMessage,
      metadata: { email },
    })
  }

  public async logSignupAttempt(
    userId: string | null,
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: success ? "signup_success" : "signup_failure",
      eventCategory: "user_management",
      eventDescription: success ? `Successful signup for ${email}` : `Failed signup attempt for ${email}`,
      ipAddress,
      userAgent,
      riskLevel: "low",
      success,
      errorMessage,
      metadata: { email },
    })
  }

  public async logSignup(userId: string, email: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.logSignupAttempt(userId, email, true, ipAddress, userAgent)
  }

  public async logLogout(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      eventType: "logout",
      eventCategory: "authentication",
      eventDescription: `User logout for ${email}`,
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
      metadata: { email },
    })
  }

  public async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      eventType: "password_change",
      eventCategory: "security",
      eventDescription: "User password changed",
      ipAddress,
      userAgent,
      riskLevel: "medium",
      success: true,
    })
  }

  public async logTokenRefresh(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      eventType: "token_refresh",
      eventCategory: "authentication",
      eventDescription: "Authentication token refreshed",
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
    })
  }

  // Security Events
  public async logSuspiciousActivity(
    userId: string | null,
    activityType: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: "suspicious_activity",
      eventCategory: "security",
      eventDescription: `Suspicious activity detected: ${description}`,
      ipAddress,
      userAgent,
      riskLevel: "high",
      success: false,
      metadata: { activityType, ...metadata },
    })
  }

  public async logUnauthorizedAccess(
    userId: string | null,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: "unauthorized_access",
      eventCategory: "authorization",
      eventDescription: `Unauthorized access attempt to ${resource}`,
      ipAddress,
      userAgent,
      riskLevel: "high",
      success: false,
      metadata: { resource },
    })
  }

  public async logRateLimitExceeded(ipAddress: string, endpoint: string, userAgent?: string): Promise<void> {
    await this.log({
      eventType: "rate_limit_exceeded",
      eventCategory: "security",
      eventDescription: `Rate limit exceeded for endpoint ${endpoint}`,
      ipAddress,
      userAgent,
      riskLevel: "medium",
      success: false,
      metadata: { endpoint },
    })
  }

  // Data Access Events
  public async logDataAccess(
    userId: string,
    dataType: string,
    action: string,
    recordId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: "data_access",
      eventCategory: "data_access",
      eventDescription: `${action} access to ${dataType}${recordId ? ` (ID: ${recordId})` : ""}`,
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
      metadata: { dataType, action, recordId },
    })
  }

  // Trading Events
  public async logTradingAction(
    userId: string,
    action: string,
    symbol: string,
    amount?: number,
    price?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      eventType: "trading_action",
      eventCategory: "trading",
      eventDescription: `Trading action: ${action} ${symbol}`,
      ipAddress,
      userAgent,
      riskLevel: "medium",
      success: true,
      metadata: { action, symbol, amount, price },
    })
  }

  // System Events
  public async logSystemEvent(eventType: string, description: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      eventType,
      eventCategory: "system",
      eventDescription: description,
      riskLevel: "low",
      success: true,
      metadata,
    })
  }

  // API Events
  public async logApiCall(
    userId: string | null,
    endpoint: string,
    method: string,
    statusCode: number,
    ipAddress?: string,
    userAgent?: string,
    responseTime?: number,
  ): Promise<void> {
    const success = statusCode >= 200 && statusCode < 400
    const riskLevel: RiskLevel = statusCode >= 500 ? "high" : statusCode >= 400 ? "medium" : "low"

    await this.log({
      userId,
      eventType: "api_call",
      eventCategory: "api",
      eventDescription: `${method} ${endpoint} - ${statusCode}`,
      ipAddress,
      userAgent,
      riskLevel,
      success,
      metadata: { endpoint, method, statusCode, responseTime },
    })
  }

  private validateIpAddress(ip?: string): string | null {
    if (!ip || ip === "unknown" || ip === "") {
      return null
    }

    // Basic IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
      return ip
    }

    return null
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger()

// Database query functions with error handling
export async function getAuditLogs(filter: AuditLogFilter = []) {
  try {
    const { db } = await connectToDatabase()
    const {
      userId,
      eventCategory,
      eventType,
      riskLevel,
      success,
      startDate,
      endDate,
      ipAddress,
      limit = 100,
      offset = 0,
    } = filter

    const query: any = {}

    if (userId) query.user_id = userId
    if (eventCategory) query.event_category = eventCategory
    if (eventType) query.event_type = eventType
    if (riskLevel) query.risk_level = riskLevel
    if (success !== undefined) query.success = success
    if (startDate || endDate) {
      query.created_at = {}
      if (startDate) query.created_at.$gte = startDate
      if (endDate) query.created_at.$lte = endDate
    }
    if (ipAddress) query.ip_address = ipAddress

    const logs = await db
      .collection("audit_logs")
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(offset)
      .toArray()

    return logs
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }
}

export async function getAuditLogStats() {
  try {
    const { db } = await connectToDatabase()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const stats = await db
      .collection("audit_logs")
      .aggregate([
        { $match: { created_at: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: null,
            total_events: { $sum: 1 },
            failed_events: { $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] } },
            high_risk_events: { $sum: { $cond: [{ $eq: ["$risk_level", "high"] }, 1, 0] } },
            critical_events: { $sum: { $cond: [{ $eq: ["$risk_level", "critical"] }, 1, 0] } },
            events_last_24h: {
              $sum: {
                $cond: [{ $gte: ["$created_at", new Date(Date.now() - 24 * 60 * 60 * 1000)] }, 1, 0],
              },
            },
            events_last_7d: {
              $sum: {
                $cond: [{ $gte: ["$created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }, 1, 0],
              },
            },
            unique_users: { $addToSet: "$user_id" },
            unique_ips: { $addToSet: "$ip_address" },
          },
        },
        {
          $project: {
            total_events: 1,
            failed_events: 1,
            high_risk_events: 1,
            critical_events: 1,
            events_last_24h: 1,
            events_last_7d: 1,
            unique_users: { $size: "$unique_users" },
            unique_ips: { $size: "$unique_ips" },
          },
        },
      ])
      .toArray()

    return (
      stats[0] || {
        total_events: 0,
        failed_events: 0,
        high_risk_events: 0,
        critical_events: 0,
        events_last_24h: 0,
        events_last_7d: 0,
        unique_users: 0,
        unique_ips: 0,
      }
    )
  } catch (error) {
    console.error("Error fetching audit log stats:", error)
    return {
      total_events: 0,
      failed_events: 0,
      high_risk_events: 0,
      critical_events: 0,
      events_last_24h: 0,
      events_last_7d: 0,
      unique_users: 0,
      unique_ips: 0,
    }
  }
}

export async function getTopEventTypes(limit = 10) {
  try {
    const { db } = await connectToDatabase()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const eventTypes = await db
      .collection("audit_logs")
      .aggregate([
        { $match: { created_at: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { event_type: "$event_type", event_category: "$event_category" },
            count: { $sum: 1 },
            failed_count: { $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            event_type: "$_id.event_type",
            event_category: "$_id.event_category",
            count: 1,
            failed_count: 1,
          },
        },
      ])
      .toArray()

    return eventTypes
  } catch (error) {
    console.error("Error fetching top event types:", error)
    return []
  }
}

export async function getSecurityAlerts() {
  try {
    const { db } = await connectToDatabase()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const alerts = await db
      .collection("audit_logs")
      .find({
        risk_level: { $in: ["high", "critical"] },
        created_at: { $gte: twentyFourHoursAgo },
      })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray()

    return alerts
  } catch (error) {
    console.error("Error fetching security alerts:", error)
    return []
  }
}
