"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, ArrowRight, Download, Settings } from "lucide-react"
import Link from "next/link"

interface SessionData {
  id: string
  amount_total: number
  currency: string
  customer_details: {
    email: string
    name: string
  }
  metadata: {
    planId: string
    userId: string
    addOns?: string
  }
  payment_status: string
  status: string
}

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchSessionData(sessionId)
    } else {
      setError("No session ID provided")
      setLoading(false)
    }
  }, [sessionId])

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`)
      const data = await response.json()

      if (response.ok) {
        setSessionData(data.session)
      } else {
        setError(data.error || "Failed to fetch session data")
      }
    } catch (error) {
      setError("Failed to fetch session data")
    } finally {
      setLoading(false)
    }
  }

  const getPlanName = (planId: string) => {
    const planNames = {
      starter: "Starter Plan",
      pro: "Pro Trader",
      enterprise: "Enterprise",
    }
    return planNames[planId as keyof typeof planNames] || planId
  }

  const getPlanEmoji = (planId: string) => {
    const planEmojis = {
      starter: "🔵",
      pro: "🟡",
      enterprise: "🔴",
    }
    return planEmojis[planId as keyof typeof planEmojis] || "✅"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing your subscription...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Payment Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/subscription">Try Again</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-2">🎉 Welcome to CoinWayFinder!</h1>
          <p className="text-xl text-muted-foreground">Your subscription has been activated successfully</p>
        </div>

        {/* Subscription Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getPlanEmoji(sessionData.metadata.planId)}</span>
              Subscription Activated
            </CardTitle>
            <CardDescription>
              Your {getPlanName(sessionData.metadata.planId)} is now active and ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Plan Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <Badge variant="secondary">{getPlanName(sessionData.metadata.planId)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">
                      ${(sessionData.amount_total / 100).toFixed(2)} {sessionData.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{sessionData.customer_details.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{sessionData.customer_details.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session ID:</span>
                    <span className="font-mono text-xs">{sessionData.id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </div>

            {sessionData.metadata.addOns && (
              <div>
                <h4 className="font-semibold mb-2">Add-ons Included</h4>
                <div className="flex flex-wrap gap-2">
                  {sessionData.metadata.addOns.split(",").map((addOn, index) => (
                    <Badge key={index} variant="outline">
                      {addOn}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 What's Next?</CardTitle>
            <CardDescription>Get started with your new CoinWayFinder subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold mb-1">Create Your First Bot</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up your first AI trading bot with our easy-to-use interface
                </p>
                <Button size="sm" asChild>
                  <Link href="/bots">
                    Create Bot <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold mb-1">View Dashboard</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor your portfolio and track performance in real-time
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-semibold mb-1">Configure Settings</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up your exchange connections and risk preferences
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/integrations">
                    Settings <Settings className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Need Help?</CardTitle>
            <CardDescription>We're here to help you get the most out of CoinWayFinder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">📚 Resources</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    •{" "}
                    <Link href="/docs" className="text-primary hover:underline">
                      Getting Started Guide
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="/docs/strategies" className="text-primary hover:underline">
                      Trading Strategies
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="/docs/api" className="text-primary hover:underline">
                      API Documentation
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="/docs/faq" className="text-primary hover:underline">
                      Frequently Asked Questions
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">💬 Support</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    •{" "}
                    <Link href="mailto:support@coinwayfinder.com" className="text-primary hover:underline">
                      Email Support
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="https://t.me/coinwayfinder" className="text-primary hover:underline">
                      Telegram Community
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="/support" className="text-primary hover:underline">
                      Submit a Ticket
                    </Link>
                  </li>
                  <li>
                    •{" "}
                    <Link href="/support/priority" className="text-primary hover:underline">
                      Priority Support
                    </Link>{" "}
                    (Pro+)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Download */}
        <div className="text-center mt-8">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}
