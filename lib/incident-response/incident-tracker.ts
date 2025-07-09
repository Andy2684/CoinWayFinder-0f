import { Redis } from "ioredis"

export interface Incident {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "investigating" | "contained" | "resolved" | "closed"
  type: string
  assignee?: string
  reporter: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  tags: string[]
  timeline: IncidentTimelineEntry[]
  affectedSystems: string[]
  impactAssessment: {
    usersAffected?: number
    systemsAffected: string[]
    dataCompromised: boolean
    serviceDisruption: boolean
    estimatedDowntime?: number
  }
  responseActions: ResponseAction[]
  postMortem?: {
    rootCause: string
    contributingFactors: string[]
    lessonsLearned: string[]
    preventionMeasures: string[]
    completedAt: Date
  }
}

export interface IncidentTimelineEntry {
  id: string
  timestamp: Date
  type: "created" | "updated" | "escalated" | "contained" | "resolved" | "note" | "action"
  description: string
  author: string
  metadata?: Record<string, any>
}

export interface ResponseAction {
  id: string
  description: string
  assignee: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
  notes?: string
}

export class IncidentTracker {
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
  }

  async createIncident(incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt" | "timeline">): Promise<Incident> {
    const incident: Incident = {
      id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: [
        {
          id: `timeline_${Date.now()}`,
          timestamp: new Date(),
          type: "created",
          description: `Incident created: ${incidentData.title}`,
          author: incidentData.reporter,
        },
      ],
      ...incidentData,
    }

    await this.saveIncident(incident)
    await this.notifyIncidentCreated(incident)

    console.log(`📋 Incident created: ${incident.id} - ${incident.title}`)
    return incident
  }

  async updateIncident(incidentId: string, updates: Partial<Incident>, author: string): Promise<Incident | null> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return null

    const updatedIncident: Incident = {
      ...incident,
      ...updates,
      updatedAt: new Date(),
      timeline: [
        ...incident.timeline,
        {
          id: `timeline_${Date.now()}`,
          timestamp: new Date(),
          type: "updated",
          description: `Incident updated by ${author}`,
          author,
          metadata: updates,
        },
      ],
    }

    await this.saveIncident(updatedIncident)
    await this.notifyIncidentUpdated(updatedIncident, updates)

    return updatedIncident
  }

  async addTimelineEntry(incidentId: string, entry: Omit<IncidentTimelineEntry, "id" | "timestamp">): Promise<boolean> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return false

    const timelineEntry: IncidentTimelineEntry = {
      id: `timeline_${Date.now()}`,
      timestamp: new Date(),
      ...entry,
    }

    incident.timeline.push(timelineEntry)
    incident.updatedAt = new Date()

    await this.saveIncident(incident)
    return true
  }

  async addResponseAction(incidentId: string, action: Omit<ResponseAction, "id" | "createdAt">): Promise<boolean> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return false

    const responseAction: ResponseAction = {
      id: `action_${Date.now()}`,
      createdAt: new Date(),
      ...action,
    }

    incident.responseActions.push(responseAction)
    incident.updatedAt = new Date()

    // Add timeline entry
    incident.timeline.push({
      id: `timeline_${Date.now()}`,
      timestamp: new Date(),
      type: "action",
      description: `Response action added: ${action.description}`,
      author: action.assignee,
    })

    await this.saveIncident(incident)
    return true
  }

  async updateResponseAction(
    incidentId: string,
    actionId: string,
    updates: Partial<ResponseAction>,
    author: string,
  ): Promise<boolean> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return false

    const actionIndex = incident.responseActions.findIndex((action) => action.id === actionId)
    if (actionIndex === -1) return false

    incident.responseActions[actionIndex] = {
      ...incident.responseActions[actionIndex],
      ...updates,
    }

    if (updates.status === "completed") {
      incident.responseActions[actionIndex].completedAt = new Date()
    }

    incident.updatedAt = new Date()

    // Add timeline entry
    incident.timeline.push({
      id: `timeline_${Date.now()}`,
      timestamp: new Date(),
      type: "action",
      description: `Response action updated: ${incident.responseActions[actionIndex].description} - ${updates.status}`,
      author,
    })

    await this.saveIncident(incident)
    return true
  }

  async resolveIncident(incidentId: string, resolver: string, resolution: string): Promise<Incident | null> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return null

    const resolvedIncident: Incident = {
      ...incident,
      status: "resolved",
      resolvedAt: new Date(),
      updatedAt: new Date(),
      timeline: [
        ...incident.timeline,
        {
          id: `timeline_${Date.now()}`,
          timestamp: new Date(),
          type: "resolved",
          description: `Incident resolved by ${resolver}: ${resolution}`,
          author: resolver,
        },
      ],
    }

    await this.saveIncident(resolvedIncident)
    await this.notifyIncidentResolved(resolvedIncident)

    console.log(`✅ Incident resolved: ${incident.id}`)
    return resolvedIncident
  }

  async escalateIncident(incidentId: string, newSeverity: Incident["severity"], escalator: string): Promise<boolean> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return false

    const oldSeverity = incident.severity
    incident.severity = newSeverity
    incident.updatedAt = new Date()

    incident.timeline.push({
      id: `timeline_${Date.now()}`,
      timestamp: new Date(),
      type: "escalated",
      description: `Incident escalated from ${oldSeverity} to ${newSeverity} by ${escalator}`,
      author: escalator,
    })

    await this.saveIncident(incident)
    await this.notifyIncidentEscalated(incident, oldSeverity)

    console.log(`⬆️ Incident escalated: ${incident.id} (${oldSeverity} → ${newSeverity})`)
    return true
  }

  async addPostMortem(
    incidentId: string,
    postMortem: Omit<NonNullable<Incident["postMortem"]>, "completedAt">,
    author: string,
  ): Promise<boolean> {
    const incident = await this.getIncident(incidentId)
    if (!incident) return false

    incident.postMortem = {
      ...postMortem,
      completedAt: new Date(),
    }

    incident.timeline.push({
      id: `timeline_${Date.now()}`,
      timestamp: new Date(),
      type: "note",
      description: `Post-mortem completed by ${author}`,
      author,
    })

    await this.saveIncident(incident)
    return true
  }

  async getIncident(incidentId: string): Promise<Incident | null> {
    try {
      const incidentData = await this.redis.get(`incident:${incidentId}`)
      if (!incidentData) return null

      const incident = JSON.parse(incidentData)
      // Convert date strings back to Date objects
      incident.createdAt = new Date(incident.createdAt)
      incident.updatedAt = new Date(incident.updatedAt)
      if (incident.resolvedAt) incident.resolvedAt = new Date(incident.resolvedAt)
      if (incident.postMortem?.completedAt) incident.postMortem.completedAt = new Date(incident.postMortem.completedAt)

      incident.timeline = incident.timeline.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }))

      incident.responseActions = incident.responseActions.map((action: any) => ({
        ...action,
        createdAt: new Date(action.createdAt),
        completedAt: action.completedAt ? new Date(action.completedAt) : undefined,
      }))

      return incident
    } catch (error) {
      console.error(`Failed to get incident ${incidentId}:`, error)
      return null
    }
  }

  async listIncidents(filters?: {
    status?: Incident["status"]
    severity?: Incident["severity"]
    assignee?: string
    limit?: number
  }): Promise<Incident[]> {
    try {
      const incidentKeys = await this.redis.keys("incident:*")
      const incidents: Incident[] = []

      for (const key of incidentKeys) {
        const incidentData = await this.redis.get(key)
        if (incidentData) {
          const incident = JSON.parse(incidentData)
          incidents.push(incident)
        }
      }

      // Apply filters
      let filteredIncidents = incidents

      if (filters?.status) {
        filteredIncidents = filteredIncidents.filter((inc) => inc.status === filters.status)
      }

      if (filters?.severity) {
        filteredIncidents = filteredIncidents.filter((inc) => inc.severity === filters.severity)
      }

      if (filters?.assignee) {
        filteredIncidents = filteredIncidents.filter((inc) => inc.assignee === filters.assignee)
      }

      // Sort by creation date (newest first)
      filteredIncidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Apply limit
      if (filters?.limit) {
        filteredIncidents = filteredIncidents.slice(0, filters.limit)
      }

      return filteredIncidents
    } catch (error) {
      console.error("Failed to list incidents:", error)
      return []
    }
  }

  async getIncidentMetrics(): Promise<{
    total: number
    byStatus: Record<string, number>
    bySeverity: Record<string, number>
    averageResolutionTime: number
    openIncidents: number
  }> {
    const incidents = await this.listIncidents()

    const metrics = {
      total: incidents.length,
      byStatus: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      averageResolutionTime: 0,
      openIncidents: 0,
    }

    let totalResolutionTime = 0
    let resolvedCount = 0

    incidents.forEach((incident) => {
      // Count by status
      metrics.byStatus[incident.status] = (metrics.byStatus[incident.status] || 0) + 1

      // Count by severity
      metrics.bySeverity[incident.severity] = (metrics.bySeverity[incident.severity] || 0) + 1

      // Calculate resolution time
      if (incident.resolvedAt) {
        const resolutionTime = incident.resolvedAt.getTime() - incident.createdAt.getTime()
        totalResolutionTime += resolutionTime
        resolvedCount++
      }

      // Count open incidents
      if (["open", "investigating", "contained"].includes(incident.status)) {
        metrics.openIncidents++
      }
    })

    // Calculate average resolution time in minutes
    if (resolvedCount > 0) {
      metrics.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / 1000 / 60)
    }

    return metrics
  }

  private async saveIncident(incident: Incident): Promise<void> {
    await this.redis.set(`incident:${incident.id}`, JSON.stringify(incident))
    await this.redis.zadd("incidents_by_date", incident.createdAt.getTime(), incident.id)
  }

  private async notifyIncidentCreated(incident: Incident): Promise<void> {
    const notification = {
      type: "incident_created",
      incident: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        assignee: incident.assignee,
      },
      timestamp: new Date().toISOString(),
    }

    await this.sendNotification(notification)
  }

  private async notifyIncidentUpdated(incident: Incident, updates: Partial<Incident>): Promise<void> {
    const notification = {
      type: "incident_updated",
      incident: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
      },
      updates,
      timestamp: new Date().toISOString(),
    }

    await this.sendNotification(notification)
  }

  private async notifyIncidentResolved(incident: Incident): Promise<void> {
    const resolutionTime =
      incident.resolvedAt && incident.createdAt
        ? Math.round((incident.resolvedAt.getTime() - incident.createdAt.getTime()) / 1000 / 60)
        : 0

    const notification = {
      type: "incident_resolved",
      incident: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        resolutionTime: `${resolutionTime} minutes`,
      },
      timestamp: new Date().toISOString(),
    }

    await this.sendNotification(notification)
  }

  private async notifyIncidentEscalated(incident: Incident, oldSeverity: string): Promise<void> {
    const notification = {
      type: "incident_escalated",
      incident: {
        id: incident.id,
        title: incident.title,
        oldSeverity,
        newSeverity: incident.severity,
      },
      timestamp: new Date().toISOString(),
    }

    await this.sendNotification(notification)
  }

  private async sendNotification(notification: any): Promise<void> {
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        })
      } catch (error) {
        console.error("Failed to send incident notification:", error)
      }
    }
  }
}

// Create singleton instance
export const incidentTracker = new IncidentTracker()
