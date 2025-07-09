"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles, Zap } from "lucide-react"

interface TrialStatus {
  hasTrialAvailable: boolean
  isInTrial: boolean
  trialDaysLeft: number
  trialEndDate?: Date
}

export function TrialBanner() {
  const { user } = useAuth()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchTrialStatus()
    }
  }, [user])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch(`/api/subscription/trial-status?userId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        setTrialStatus({
          hasTrialAvailable: data.hasTrialAvailable,
          isInTrial: data.isInTrial,
          trialDaysLeft: data.trialDaysLeft,
          trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : undefined,
        })
      }
    } catch (error) {
      console.error("Failed to fetch trial status:", error)
    }
  }

  const startTrial = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh trial status
        await fetchTrialStatus()
        // You might want to show a success message or redirect
        window.location.reload()
      } else {
        console.error("Failed to start trial:", data.error)
      }
    } catch (error) {
      console.error("Error starting trial:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!trialStatus) return null

  // Show trial available banner
  if (trialStatus.hasTrialAvailable && !trialStatus.isInTrial) {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Start Your 3-Day Free Trial</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Free Trial
            </Badge>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-200">
            Get full access to premium features for 3 days - no credit card required!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-300">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>3 Trading Bots</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Whale Tracking</span>
              </div>
            </div>
            <Button onClick={startTrial} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Starting..." : "Start Free Trial"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show active trial banner
  if (trialStatus.isInTrial) {
    const isExpiringSoon = trialStatus.trialDaysLeft <= 1

    return (
      <Card
        className={`border-2 ${
          isExpiringSoon
            ? "border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
            : "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isExpiringSoon ? "text-orange-600" : "text-green-600"}`} />
              <CardTitle
                className={`text-lg ${
                  isExpiringSoon ? "text-orange-900 dark:text-orange-100" : "text-green-900 dark:text-green-100"
                }`}
              >
                Free Trial Active
              </CardTitle>
            </div>
            <Badge
              variant="secondary"
              className={
                isExpiringSoon
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              }
            >
              {trialStatus.trialDaysLeft} day{trialStatus.trialDaysLeft !== 1 ? "s" : ""} left
            </Badge>
          </div>
          <CardDescription
            className={isExpiringSoon ? "text-orange-700 dark:text-orange-200" : "text-green-700 dark:text-green-200"}
          >
            {isExpiringSoon
              ? "Your trial expires soon! Upgrade to continue using premium features."
              : "You're enjoying full access to all premium features."}
          </CardDescription>
        </CardHeader>
        {isExpiringSoon && (
          <CardContent className="pt-0">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">Upgrade Now to Continue</Button>
          </CardContent>
        )}
      </Card>
    )
  }

  return null
}
