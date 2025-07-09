import { type NextRequest, NextResponse } from "next/server"
import { incidentTracker, type Incident } from "../../../lib/incident-response/incident-tracker"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as Incident["status"] | null
    const severity = searchParams.get("severity") as Incident["severity"] | null
    const assignee = searchParams.get("assignee")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const incidents = await incidentTracker.listIncidents({
      status: status || undefined,
      severity: severity || undefined,
      assignee: assignee || undefined,
      limit,
    })

    const metrics = await incidentTracker.getIncidentMetrics()

    return NextResponse.json({
      incidents,
      metrics,
      filters: {
        status,
        severity,
        assignee,
        limit,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get incidents:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve incidents",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "create":
        const incident = await incidentTracker.createIncident(data)
        return NextResponse.json({ incident }, { status: 201 })

      case "update":
        const { incidentId, updates, author } = data
        const updatedIncident = await incidentTracker.updateIncident(incidentId, updates, author)
        if (!updatedIncident) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ incident: updatedIncident })

      case "resolve":
        const { incidentId: resolveId, resolver, resolution } = data
        const resolvedIncident = await incidentTracker.resolveIncident(resolveId, resolver, resolution)
        if (!resolvedIncident) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ incident: resolvedIncident })

      case "escalate":
        const { incidentId: escalateId, newSeverity, escalator } = data
        const escalated = await incidentTracker.escalateIncident(escalateId, newSeverity, escalator)
        if (!escalated) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })

      case "add_timeline":
        const { incidentId: timelineId, entry } = data
        const timelineAdded = await incidentTracker.addTimelineEntry(timelineId, entry)
        if (!timelineAdded) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })

      case "add_action":
        const { incidentId: actionId, action: responseAction } = data
        const actionAdded = await incidentTracker.addResponseAction(actionId, responseAction)
        if (!actionAdded) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })

      case "update_action":
        const {
          incidentId: updateActionId,
          actionId: updateActionActionId,
          updates: actionUpdates,
          author: actionAuthor,
        } = data
        const actionUpdated = await incidentTracker.updateResponseAction(
          updateActionId,
          updateActionActionId,
          actionUpdates,
          actionAuthor,
        )
        if (!actionUpdated) {
          return NextResponse.json({ error: "Incident or action not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })

      case "add_postmortem":
        const { incidentId: postmortemId, postMortem, author: postmortemAuthor } = data
        const postmortemAdded = await incidentTracker.addPostMortem(postmortemId, postMortem, postmortemAuthor)
        if (!postmortemAdded) {
          return NextResponse.json({ error: "Incident not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Failed to process incident request:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
