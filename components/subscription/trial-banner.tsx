"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Gift, Zap } from "lucide-react"

interface TrialStatus {
  hasTrialAvailable: boolean
  isInTrial: boolean
  trialEndsAt?: string
  daysRemaining?: number
}

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrialStatus()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch("/api/subscription/trial-status")
      if (response.ok) {
        const data = await response.json()
        setTrialStatus(data)
      }
    } catch (error) {
      console.error("Error fetching trial status:", error)
    } finally {
      setLoading(false)
    }
  }

  const startTrial = async () => {
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
      })

      if (response.ok) {
        await fetchTrialStatus()
        window.location.href = "/dashboard?trial=started"
      }
    } catch (error) {
      console.error("Error starting trial:", error)
    }
  }

  if (loading || !trialStatus) {
    return null
  }

  // Show trial available banner
  if (trialStatus.hasTrialAvailable && !trialStatus.isInTrial) {
    return (
      <Card className="border-2 border-primary bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Start Your Free Trial</h3>
                <p className="text-muted-foreground">Try any paid plan free for 7 days. No credit card required.</p>
              </div>
            </div>
            <Button onClick={startTrial} className="shrink-0">
              <Zap className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show active trial banner
  if (trialStatus.isInTrial) {
    const daysRemaining = trialStatus.daysRemaining || 0
    const isExpiringSoon = daysRemaining <= 2

    return (
      <Card
        className={`border-2 ${isExpiringSoon ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  isExpiringSoon ? "bg-yellow-100" : "bg-green-100"
                }`}
              >
                <Clock className={`w-6 h-6 ${isExpiringSoon ? "text-yellow-600" : "text-green-600"}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Free Trial Active</h3>
                  <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {isExpiringSoon
                    ? "Your trial expires soon. Upgrade to continue using premium features."
                    : "Enjoying your trial? Upgrade anytime to continue with premium features."}
                </p>
              </div>
            </div>
            <Button variant={isExpiringSoon ? "default" : "outline"}>
              {isExpiringSoon ? "Upgrade Now" : "View Plans"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
