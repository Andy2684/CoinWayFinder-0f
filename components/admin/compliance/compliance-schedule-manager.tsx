"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Trash2, Edit, Clock, Mail } from "lucide-react"
import type { ComplianceFramework } from "@/lib/compliance-report-generator"

interface Framework {
  id: ComplianceFramework
  name: string
  description: string
  category: string
}

interface ComplianceScheduleManagerProps {
  frameworks: Framework[]
}

interface ScheduledReport {
  id: string
  framework: ComplianceFramework
  frequency: string
  enabled: boolean
  recipients: string[]
  lastRun?: Date
  nextRun?: Date
  createdBy: string
  createdAt: Date
}

export function ComplianceScheduleManager({ frameworks }: ComplianceScheduleManagerProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null)

  // Form state
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>("SOC2")
  const [frequency, setFrequency] = useState("monthly")
  const [recipients, setRecipients] = useState("")
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    fetchScheduledReports()
  }, [])

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch("/api/admin/compliance/schedule")
      const data = await response.json()
      if (data.success) {
        setScheduledReports(data.scheduledReports || [])
      }
    } catch (error) {
      console.error("Error fetching scheduled reports:", error)
    }
  }

  const createSchedule = async () => {
    if (!recipients.trim()) {
      alert("Please enter at least one recipient email address")
      return
    }

    const recipientList = recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)

    try {
      const response = await fetch("/api/admin/compliance/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          framework: selectedFramework,
          frequency,
          recipients: recipientList,
          enabled,
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchScheduledReports()
        resetForm()
        setShowCreateForm(false)
      } else {
        alert("Failed to create schedule: " + data.error)
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      alert("Error creating schedule")
    }
  }

  const updateSchedule = async () => {
    if (!editingSchedule || !recipients.trim()) return

    const recipientList = recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)

    try {
      const response = await fetch(`/api/admin/compliance/schedule/${editingSchedule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          framework: selectedFramework,
          frequency,
          recipients: recipientList,
          enabled,
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchScheduledReports()
        resetForm()
        setEditingSchedule(null)
      } else {
        alert("Failed to update schedule: " + data.error)
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
      alert("Error updating schedule")
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled report?")) return

    try {
      const response = await fetch(`/api/admin/compliance/schedule/${scheduleId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        fetchScheduledReports()
      } else {
        alert("Failed to delete schedule: " + data.error)
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      alert("Error deleting schedule")
    }
  }

  const toggleSchedule = async (scheduleId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/compliance/schedule/${scheduleId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      })

      const data = await response.json()
      if (data.success) {
        fetchScheduledReports()
      } else {
        alert("Failed to toggle schedule: " + data.error)
      }
    } catch (error) {
      console.error("Error toggling schedule:", error)
      alert("Error toggling schedule")
    }
  }

  const resetForm = () => {
    setSelectedFramework("SOC2")
    setFrequency("monthly")
    setRecipients("")
    setEnabled(true)
  }

  const startEdit = (schedule: ScheduledReport) => {
    setEditingSchedule(schedule)
    setSelectedFramework(schedule.framework)
    setFrequency(schedule.frequency)
    setRecipients(schedule.recipients.join(", "))
    setEnabled(schedule.enabled)
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingSchedule(null)
    setShowCreateForm(false)
    resetForm()
  }

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case "daily":
        return "bg-red-500"
      case "weekly":
        return "bg-orange-500"
      case "monthly":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Report Scheduling</h2>
          <p className="text-muted-foreground">Automate compliance report generation and delivery</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {editingSchedule ? "Edit Scheduled Report" : "Schedule New Report"}
            </CardTitle>
            <CardDescription>
              {editingSchedule
                ? "Update the scheduled report configuration"
                : "Set up automated compliance report generation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="framework">Compliance Framework</Label>
                  <Select
                    value={selectedFramework}
                    onValueChange={(value: ComplianceFramework) => setSelectedFramework(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
                  <Label htmlFor="enabled">Enable scheduled reports</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipients">Email Recipients</Label>
                  <Textarea
                    id="recipients"
                    placeholder="Enter email addresses separated by commas"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Separate multiple email addresses with commas</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={editingSchedule ? updateSchedule : createSchedule} className="flex-1">
                    {editingSchedule ? "Update Schedule" : "Create Schedule"}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports List */}
      <div className="grid gap-4">
        {scheduledReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No scheduled reports configured</p>
                <p className="text-sm">Create your first scheduled report to automate compliance reporting</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          scheduledReports.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {schedule.framework} - {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}{" "}
                      Report
                    </CardTitle>
                    <CardDescription>
                      Created by {schedule.createdBy} on {schedule.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getFrequencyColor(schedule.frequency)} text-white`}>
                      {schedule.frequency.toUpperCase()}
                    </Badge>
                    <Badge variant={schedule.enabled ? "default" : "secondary"}>
                      {schedule.enabled ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Recipients ({schedule.recipients.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {schedule.recipients.slice(0, 3).map((email, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                        {schedule.recipients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{schedule.recipients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Schedule Status
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {schedule.lastRun && <p>Last run: {schedule.lastRun.toLocaleDateString()}</p>}
                        {schedule.nextRun && <p>Next run: {schedule.nextRun.toLocaleDateString()}</p>}
                        {!schedule.lastRun && <p>Never run</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => toggleSchedule(schedule.id, schedule.enabled)}
                      />
                      <span className="text-sm">{schedule.enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(schedule)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
