import { sql } from "./database"

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
  userId?: string
  eventType: string
  eventCategory: EventCategory
  eventDescription: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  metadata?: Record<string, any>
  riskLevel?: RiskLevel
  success?: boolean
  errorMessage?: string
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
  private static instance: AuditLogger
  private requestId = ""

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  public setRequestId(requestId: string) {
    this.requestId = requestId
  }

  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      await sql`
        INSERT INTO audit_logs (
          user_id, event_type, event_category, event_description,
          ip_address, user_agent, session_id, request_id,
          metadata, risk_level, success, error_message
        ) VALUES (
          ${entry.userId || null},
          ${entry.eventType},
          ${entry.eventCategory},
          ${entry.eventDescription},
          ${entry.ipAddress || null},
          ${entry.userAgent || null},
          ${entry.sessionId || null},
          ${this.requestId || entry.requestId || null},
          ${JSON.stringify(entry.metadata || {})},
          ${entry.riskLevel || "low"},
          ${entry.success !== false},
          ${entry.errorMessage || null}
        )
      `
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
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
  ) {
    await this.log({
      userId,
      eventType: "login_attempt",
      eventCategory: "authentication",
      eventDescription: success ? `Successful login for ${email}` : `Failed login attempt for ${email}`,
      ipAddress,
      userAgent,
      riskLevel: success ? "low" : "medium",
      success,
      errorMessage,
      metadata: { email, loginMethod: "email_password" },
    })
  }

  public async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      eventType: "logout",
      eventCategory: "authentication",
      eventDescription: "User logged out",
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
    })
  }

  public async logSignup(userId: string, email: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      eventType: "user_signup",
      eventCategory: "user_management",
      eventDescription: `New user account created: ${email}`,
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
      metadata: { email, registrationMethod: "email" },
    })
  }

  public async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string) {
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

  public async logTokenRefresh(userId: string, ipAddress?: string, userAgent?: string) {
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
  ) {
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

  public async logUnauthorizedAccess(userId: string | null, resource: string, ipAddress?: string, userAgent?: string) {
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

  public async logRateLimitExceeded(ipAddress: string, endpoint: string, userAgent?: string) {
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
  ) {
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
  ) {
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
  public async logSystemEvent(eventType: string, description: string, metadata?: Record<string, any>) {
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
  ) {
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
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Database query functions
export async function getAuditLogs(filter: AuditLogFilter = {}) {
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

  let query = sql`
    SELECT 
      al.*,
      u.email,
      u.username,
      u.first_name as "firstName",
      u.last_name as "lastName"
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `

  const conditions = []
  const params = []

  if (userId) {
    conditions.push(`al.user_id = $${params.length + 1}`)
    params.push(userId)
  }

  if (eventCategory) {
    conditions.push(`al.event_category = $${params.length + 1}`)
    params.push(eventCategory)
  }

  if (eventType) {
    conditions.push(`al.event_type = $${params.length + 1}`)
    params.push(eventType)
  }

  if (riskLevel) {
    conditions.push(`al.risk_level = $${params.length + 1}`)
    params.push(riskLevel)
  }

  if (success !== undefined) {
    conditions.push(`al.success = $${params.length + 1}`)
    params.push(success)
  }

  if (startDate) {
    conditions.push(`al.created_at >= $${params.length + 1}`)
    params.push(startDate)
  }

  if (endDate) {
    conditions.push(`al.created_at <= $${params.length + 1}`)
    params.push(endDate)
  }

  if (ipAddress) {
    conditions.push(`al.ip_address = $${params.length + 1}`)
    params.push(ipAddress)
  }

  if (conditions.length > 0) {
    query = sql`${query} AND ${sql.raw(conditions.join(" AND "))}`
  }

  return await sql`
    ${query}
    ORDER BY al.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `
}

export async function getAuditLogStats() {
  const [stats] = await sql`
    SELECT 
      COUNT(*) as total_events,
      COUNT(CASE WHEN success = false THEN 1 END) as failed_events,
      COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_events,
      COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_events,
      COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as events_last_24h,
      COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as events_last_7d,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT ip_address) as unique_ips
    FROM audit_logs
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
  `

  return stats
}

export async function getTopEventTypes(limit = 10) {
  return await sql`
    SELECT 
      event_type,
      event_category,
      COUNT(*) as count,
      COUNT(CASE WHEN success = false THEN 1 END) as failed_count
    FROM audit_logs
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    GROUP BY event_type, event_category
    ORDER BY count DESC
    LIMIT ${limit}
  `
}

export async function getSecurityAlerts() {
  return await sql`
    SELECT 
      al.*,
      u.email,
      u.username
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.risk_level IN ('high', 'critical')
      AND al.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ORDER BY al.created_at DESC
    LIMIT 50
  `
}
