import { type NextRequest, NextResponse } from "next/server"
import { incidentTracker } from "../../../../lib/incident-response/incident-tracker"

export async function GET(request: NextRequest, { params }: { params: { incidentId: string } }) {
  try {
    const incident = await incidentTracker.getIncident(params.incidentId)

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    return NextResponse.json({ incident })
  } catch (error) {
    console.error(`Failed to get incident ${params.incidentId}:`, error)
    return NextResponse.json(
      {
        error: "Failed to retrieve incident",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
