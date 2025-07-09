"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    } else {
      setError("No session ID provided")
      setLoading(false)
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else {
        setError("Failed to fetch session data")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Confirming your payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Payment Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/subscription">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful! 🎉</h1>
          <p className="text-muted-foreground">Welcome to CoinWayFinder Premium! Your account has been upgraded.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Badge variant="secondary">ACTIVATED</Badge>
              Your Premium Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Now Unlocked</h3>
                <ul className="space-y-1 text-green-600 dark:text-green-400">
                  <li>• Multiple Trading Bots</li>
                  <li>• AI Market Analysis</li>
                  <li>• Whale Tracking</li>
                  <li>• Premium Strategies</li>
                  <li>• Priority Support</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">📧 What's Next</h3>
                <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                  <li>• Check your email for receipt</li>
                  <li>• Access your dashboard</li>
                  <li>• Create your first bot</li>
                  <li>• Join our community</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Your subscription is now active and will renew automatically. You can manage your subscription anytime
                in your account settings.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/bots">Create Your First Bot</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Need help getting started?</p>
          <Button variant="link" asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
