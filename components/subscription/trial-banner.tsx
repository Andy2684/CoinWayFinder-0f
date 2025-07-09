"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles, Zap } from "lucide-react"

interface TrialStatus {
  isEligible: boolean
  isActive: boolean
  daysRemaining: number
  startDate?: Date
  endDate?: Date
}

interface TrialBannerProps {
  onStartTrial?: () => void
}

export function TrialBanner({ onStartTrial }: TrialBannerProps) {
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
        setTrialStatus(data.trialStatus)
      }
    } catch (error) {
      console.error("Failed to fetch trial status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = async () => {
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
      })

      if (response.ok) {
        await fetchTrialStatus()
        onStartTrial?.()
      }
    } catch (error) {
      console.error("Failed to start trial:", error)
    }
  }

  if (loading || !trialStatus) {
    return null
  }

  // Show trial available banner
  if (trialStatus.isEligible) {
    return (
      <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Start Your 3-Day Free Trial
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get full access to Pro features including AI analysis, whale tracking, and advanced strategies
                </p>
              </div>
            </div>
            <Button
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show active trial banner
  if (trialStatus.isActive) {
    const isExpiringSoon = trialStatus.daysRemaining <= 1

    return (
      <Card
        className={`border-2 ${
          isExpiringSoon
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
            : "border-green-500 bg-green-50 dark:bg-green-950/20"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isExpiringSoon ? "bg-orange-500" : "bg-green-500"}`}>
                {isExpiringSoon ? <Clock className="h-5 w-5 text-white" /> : <Zap className="h-5 w-5 text-white" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3
                    className={`font-semibold ${
                      isExpiringSoon ? "text-orange-700 dark:text-orange-300" : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {isExpiringSoon ? "Trial Expiring Soon!" : "Free Trial Active"}
                  </h3>
                  <Badge variant={isExpiringSoon ? "destructive" : "default"}>
                    {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? "s" : ""} left
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isExpiringSoon
                    ? "Upgrade now to continue enjoying premium features"
                    : "Enjoying full access to all Pro features"}
                </p>
              </div>
            </div>
            {isExpiringSoon && (
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent">
                Upgrade Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
