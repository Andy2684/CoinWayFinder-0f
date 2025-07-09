"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles, Zap, AlertTriangle } from "lucide-react"

interface TrialStatus {
  hasTrialAvailable: boolean
  isInTrial: boolean
  trialDaysLeft: number
  trialEndDate?: Date
}

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingTrial, setStartingTrial] = useState(false)

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
    setStartingTrial(true)
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh trial status
        await fetchTrialStatus()
        // Show success message or redirect
        console.log("Trial started:", data)
      } else {
        const error = await response.json()
        console.error("Error starting trial:", error)
      }
    } catch (error) {
      console.error("Error starting trial:", error)
    } finally {
      setStartingTrial(false)
    }
  }

  if (loading || !trialStatus) {
    return null
  }

  // Don't show banner if user has no trial available and is not in trial
  if (!trialStatus.hasTrialAvailable && !trialStatus.isInTrial) {
    return null
  }

  // Trial available banner
  if (trialStatus.hasTrialAvailable && !trialStatus.isInTrial) {
    return (
      <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Start Your 3-Day Free Trial</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get full access to premium features including AI analysis, whale tracking, and more!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Zap className="w-3 h-3 mr-1" />3 Days Free
              </Badge>
              <Button
                onClick={startTrial}
                disabled={startingTrial}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {startingTrial ? "Starting..." : "Start Free Trial"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Active trial banner
  if (trialStatus.isInTrial) {
    const isExpiringSoon = trialStatus.trialDaysLeft <= 1
    const bannerColor = isExpiringSoon ? "from-orange-500 to-red-600" : "from-green-500 to-blue-600"
    const bgColor = isExpiringSoon
      ? "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
      : "from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20"

    return (
      <Card className={`border-2 border-gradient-to-r ${bannerColor} bg-gradient-to-r ${bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${bannerColor}`}
              >
                {isExpiringSoon ? (
                  <AlertTriangle className="w-6 h-6 text-white" />
                ) : (
                  <Clock className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isExpiringSoon ? "Trial Ending Soon!" : "Free Trial Active"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trialStatus.trialDaysLeft === 0
                    ? "Your trial expires today"
                    : `${trialStatus.trialDaysLeft} day${trialStatus.trialDaysLeft === 1 ? "" : "s"} remaining`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className={`bg-gradient-to-r ${bannerColor} text-white`}>
                <Clock className="w-3 h-3 mr-1" />
                {trialStatus.trialDaysLeft} day{trialStatus.trialDaysLeft === 1 ? "" : "s"} left
              </Badge>
              <Button
                onClick={() => (window.location.href = "/subscription")}
                className={`bg-gradient-to-r ${bannerColor} hover:opacity-90 text-white`}
              >
                {isExpiringSoon ? "Upgrade Now" : "View Plans"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
