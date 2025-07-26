import { sql } from "@/lib/database"

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
  ipAddress: string
  userAgent: string
  riskLevel: "low" | "medium" | "high"
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
  timestamp: Date
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
  private tableInitialized = false
  private initializationPromise: Promise<void> | null = null

  private constructor() {}

  public setRequestId(requestId: string) {
    this.requestId = requestId
  }

  private async ensureTableExists(): Promise<void> {
    if (this.tableInitialized) {
      return
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.initializeTable()
    return this.initializationPromise
  }

  private async initializeTable(): Promise<void> {
    try {
      // Check if table exists
      const [tableExists] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `

      if (!tableExists.exists) {
        console.log("Creating audit_logs table...")

        // Create the audit_logs table
        await sql`
          CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id INT,
            event_type VARCHAR(50) NOT NULL,
            event_category VARCHAR(30) NOT NULL,
            event_description TEXT NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            session_id VARCHAR(255),
            request_id VARCHAR(255),
            metadata JSONB DEFAULT '{}',
            risk_level VARCHAR(20) DEFAULT 'low',
            success BOOLEAN DEFAULT true,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 years')
          )
        `

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_expires_at ON audit_logs(expires_at)`

        // Create composite indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_category ON audit_logs(user_id, event_category)`
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_category_time ON audit_logs(event_category, created_at DESC)`

        console.log("Audit logs table created successfully")
      }

      this.tableInitialized = true
    } catch (error) {
      console.error("Failed to initialize audit logs table:", error)
      // Don't throw error to avoid breaking the application
    }
  }

  public async log(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    try {
      // Ensure table exists before logging
      await this.ensureTableExists()

      if (!this.tableInitialized) {
        console.warn("Audit logs table not initialized, skipping log entry")
        return
      }

      // Validate and sanitize IP address
      const validIpAddress = entry.ipAddress && this.validateIpAddress(entry.ipAddress) ? entry.ipAddress : null

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
          ${validIpAddress},
          ${entry.userAgent || ""},
          ${entry.sessionId || null},
          ${this.requestId || entry.requestId || null},
          ${entry.metadata ? JSON.stringify(entry.metadata) : null},
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
export async function getAuditLogs(filter: AuditLogFilter = {}) {
  try {
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

    // Check if table exists first
    const [tableExists] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      )
    `

    if (!tableExists.exists) {
      return []
    }

    const whereConditions = []

    if (userId) whereConditions.push(sql`al.user_id = ${userId}`)
    if (eventCategory) whereConditions.push(sql`al.event_category = ${eventCategory}`)
    if (eventType) whereConditions.push(sql`al.event_type = ${eventType}`)
    if (riskLevel) whereConditions.push(sql`al.risk_level = ${riskLevel}`)
    if (success !== undefined) whereConditions.push(sql`al.success = ${success}`)
    if (startDate) whereConditions.push(sql`al.created_at >= ${startDate}`)
    if (endDate) whereConditions.push(sql`al.created_at <= ${endDate}`)
    if (ipAddress) whereConditions.push(sql`al.ip_address = ${ipAddress}`)

    const whereClause = whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``

    return await sql`
      SELECT 
        al.*,
        u.email,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName"
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }
}

export async function getAuditLogStats() {
  try {
    // Check if table exists first
    const [tableExists] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      )
    `

    if (!tableExists.exists) {
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
    // Check if table exists first
    const [tableExists] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      )
    `

    if (!tableExists.exists) {
      return []
    }

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
  } catch (error) {
    console.error("Error fetching top event types:", error)
    return []
  }
}

export async function getSecurityAlerts() {
  try {
    // Check if table exists first
    const [tableExists] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      )
    `

    if (!tableExists.exists) {
      return []
    }

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
  } catch (error) {
    console.error("Error fetching security alerts:", error)
    return []
  }
}
