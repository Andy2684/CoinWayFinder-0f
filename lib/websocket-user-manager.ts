import { Server as SocketIOServer, type Socket } from "socket.io"
import type { Server as HTTPServer } from "http"
import jwt from "jsonwebtoken"
import { getUserDatabase, type User } from "./real-time-user-db"

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: User
}

interface UserConnection {
  userId: string
  socketId: string
  connectedAt: Date
  lastActivity: Date
  metadata: {
    ip: string
    userAgent: string
    page: string
  }
}

class WebSocketUserManager {
  private io: SocketIOServer
  private userConnections: Map<string, UserConnection[]> = new Map()
  private socketToUser: Map<string, string> = new Map()
  private userDatabase = getUserDatabase()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    })

    this.setupEventHandlers()
    this.setupDatabaseListeners()
    this.startCleanupInterval()
  }

  private setupEventHandlers() {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "")

        if (!token) {
          return next(new Error("Authentication token required"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
        const user = await this.userDatabase.getUserById(decoded.userId)

        if (!user) {
          return next(new Error("User not found"))
        }

        socket.userId = user.id
        socket.user = user
        next()
      } catch (error) {
        next(new Error("Authentication failed"))
      }
    })

    this.io.on("connection", (socket: any) => {
      this.handleConnection(socket)
    })
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!
    const socketId = socket.id

    console.log(`🔌 User ${userId} connected via WebSocket`)

    // Track connection
    this.addUserConnection(userId, {
      userId,
      socketId,
      connectedAt: new Date(),
      lastActivity: new Date(),
      metadata: {
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers["user-agent"] || "",
        page: socket.handshake.headers.referer || "",
      },
    })

    // Join user-specific room
    socket.join(`user:${userId}`)
    socket.join("authenticated-users")

    // Update user activity
    this.userDatabase.updateUserActivity(userId, {
      ip_address: socket.handshake.address,
      action: "websocket_connect",
    })

    // Send initial data
    this.sendUserData(socket)

    // Handle events
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() })
      this.updateUserActivity(userId, socketId)
    })

    socket.on("subscribe", (data: { channels: string[] }) => {
      data.channels.forEach((channel) => {
        if (this.isValidChannel(channel, userId)) {
          socket.join(channel)
          console.log(`📡 User ${userId} subscribed to ${channel}`)
        }
      })
    })

    socket.on("unsubscribe", (data: { channels: string[] }) => {
      data.channels.forEach((channel) => {
        socket.leave(channel)
        console.log(`📡 User ${userId} unsubscribed from ${channel}`)
      })
    })

    socket.on("user:update-preferences", async (data) => {
      try {
        const updatedUser = await this.userDatabase.updateUserPreferences(userId, data.preferences)
        if (updatedUser) {
          socket.emit("user:preferences-updated", { preferences: updatedUser.preferences })
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to update preferences" })
      }
    })

    socket.on("user:get-stats", async () => {
      try {
        const stats = await this.userDatabase.getUserStats()
        socket.emit("user:stats", stats)
      } catch (error) {
        socket.emit("error", { message: "Failed to get user stats" })
      }
    })

    socket.on("user:get-sessions", async () => {
      try {
        const sessions = await this.userDatabase.getUserSessions(userId)
        socket.emit("user:sessions", sessions)
      } catch (error) {
        socket.emit("error", { message: "Failed to get user sessions" })
      }
    })

    socket.on("user:invalidate-session", async (data: { sessionId: string }) => {
      try {
        const success = await this.userDatabase.invalidateSession(data.sessionId)
        socket.emit("user:session-invalidated", { success, sessionId: data.sessionId })
      } catch (error) {
        socket.emit("error", { message: "Failed to invalidate session" })
      }
    })

    socket.on("disconnect", (reason) => {
      console.log(`🔌 User ${userId} disconnected: ${reason}`)
      this.removeUserConnection(userId, socketId)

      this.userDatabase.updateUserActivity(userId, {
        action: "websocket_disconnect",
      })
    })

    socket.on("error", (error) => {
      console.error(`❌ WebSocket error for user ${userId}:`, error)
    })
  }

  private setupDatabaseListeners() {
    this.userDatabase.on("userUpdated", (user: User) => {
      this.io.to(`user:${user.id}`).emit("user:updated", {
        user: this.sanitizeUser(user),
        timestamp: new Date(),
      })
    })

    this.userDatabase.on("userPreferencesUpdated", (user: User) => {
      this.io.to(`user:${user.id}`).emit("user:preferences-updated", {
        preferences: user.preferences,
        timestamp: new Date(),
      })
    })

    this.userDatabase.on("sessionInvalidated", (data: { sessionId: string }) => {
      this.io.emit("user:session-invalidated", data)
    })

    this.userDatabase.on("allUserSessionsInvalidated", (data: { userId: string }) => {
      this.io.to(`user:${data.userId}`).emit("user:all-sessions-invalidated", data)
    })

    this.userDatabase.on("userLocked", (data: { userId: string; lockUntil: Date }) => {
      this.io.to(`user:${data.userId}`).emit("user:account-locked", {
        message: "Your account has been temporarily locked due to security reasons",
        lockUntil: data.lockUntil,
      })
    })
  }

  private addUserConnection(userId: string, connection: UserConnection) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, [])
    }

    this.userConnections.get(userId)!.push(connection)
    this.socketToUser.set(connection.socketId, userId)

    // Broadcast user online status
    this.io.emit("user:online", { userId, timestamp: new Date() })
  }

  private removeUserConnection(userId: string, socketId: string) {
    const connections = this.userConnections.get(userId)
    if (connections) {
      const index = connections.findIndex((conn) => conn.socketId === socketId)
      if (index !== -1) {
        connections.splice(index, 1)

        if (connections.length === 0) {
          this.userConnections.delete(userId)
          // Broadcast user offline status
          this.io.emit("user:offline", { userId, timestamp: new Date() })
        }
      }
    }

    this.socketToUser.delete(socketId)
  }

  private updateUserActivity(userId: string, socketId: string) {
    const connections = this.userConnections.get(userId)
    if (connections) {
      const connection = connections.find((conn) => conn.socketId === socketId)
      if (connection) {
        connection.lastActivity = new Date()
      }
    }
  }

  private async sendUserData(socket: AuthenticatedSocket) {
    try {
      const user = socket.user!
      const sessions = await this.userDatabase.getUserSessions(user.id!)
      const stats = await this.userDatabase.getUserStats()

      socket.emit("user:initial-data", {
        user: this.sanitizeUser(user),
        sessions,
        stats,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error sending user data:", error)
      socket.emit("error", { message: "Failed to load user data" })
    }
  }

  private isValidChannel(channel: string, userId: string): boolean {
    const validChannels = [
      `user:${userId}`,
      "market-data",
      "trading-signals",
      "news-updates",
      "price-alerts",
      "bot-updates",
      "portfolio-updates",
    ]

    return validChannels.includes(channel) || channel.startsWith(`user:${userId}:`)
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password_hash, security, ...sanitized } = user
    return {
      ...sanitized,
      security: {
        two_factor_enabled: security.two_factor_enabled,
        login_attempts: security.login_attempts,
        locked_until: security.locked_until,
        last_password_change: security.last_password_change,
      },
    }
  }

  private startCleanupInterval() {
    // Clean up inactive connections every 5 minutes
    setInterval(
      () => {
        const now = new Date()
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

        for (const [userId, connections] of this.userConnections.entries()) {
          const activeConnections = connections.filter((conn) => conn.lastActivity > fiveMinutesAgo)

          if (activeConnections.length !== connections.length) {
            if (activeConnections.length === 0) {
              this.userConnections.delete(userId)
              this.io.emit("user:offline", { userId, timestamp: now })
            } else {
              this.userConnections.set(userId, activeConnections)
            }
          }
        }
      },
      5 * 60 * 1000,
    )

    // Clean up expired sessions every hour
    setInterval(
      async () => {
        try {
          const cleanedCount = await this.userDatabase.cleanupExpiredSessions()
          if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`)
          }
        } catch (error) {
          console.error("Error during session cleanup:", error)
        }
      },
      60 * 60 * 1000,
    )
  }

  // Public methods
  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  public broadcastToAllUsers(event: string, data: any) {
    this.io.to("authenticated-users").emit(event, data)
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userConnections.keys())
  }

  public getUserConnectionCount(userId: string): number {
    return this.userConnections.get(userId)?.length || 0
  }

  public getTotalConnections(): number {
    let total = 0
    for (const connections of this.userConnections.values()) {
      total += connections.length
    }
    return total
  }

  public getConnectionStats() {
    return {
      totalUsers: this.userConnections.size,
      totalConnections: this.getTotalConnections(),
      averageConnectionsPerUser: this.getTotalConnections() / Math.max(this.userConnections.size, 1),
    }
  }
}

export { WebSocketUserManager }
