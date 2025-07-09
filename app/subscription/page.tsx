"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { Loader2 } from "lucide-react"

interface UsageStats {
  botsCreated: number
  maxBots: number
  tradesExecuted: number
  maxTrades: number
  aiAnalysisUsed: number
  maxAiAnalysis: number
}

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [currentPlan, setCurrentPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.subscription) {
      setCurrentPlan(user.subscription.plan)
    }
    fetchUsageStats()
  }, [user])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      const data = await response.json()

      if (data.success) {
        setUsageStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.success) {
        await refreshUser()
        // Redirect to payment or show success message
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    }
  }

  const getSubscriptionStatus = () => {
    if (!user?.subscription) return { status: "No subscription", color: "text-muted-foreground" }

    const { status, endDate } = user.subscription
    const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (status === "expired") {
      return { status: "Expired", color: "text-red-600" }
    }

    if (daysLeft <= 7 && status === "active") {
      return { status: `Expires in ${daysLeft} days`, color: "text-yellow-600" }
    }

    return { status: "Active", color: "text-green-600" }
  }

  const subscriptionStatus = getSubscriptionStatus()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading subscription plans...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SubscriptionPlans currentPlan={currentPlan} userId={user?.id} />
    </div>
  )
}
