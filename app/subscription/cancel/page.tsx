"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function SubscriptionCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-muted-foreground">No worries! Your payment was cancelled and no charges were made.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>
              You cancelled the payment process before it was completed. This is completely normal and happens often.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Common reasons for cancellation:
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Wanted to review the features again</li>
                <li>• Needed to check with team/budget</li>
                <li>• Preferred to try the free plan first</li>
                <li>• Had questions about the service</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/subscription">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard">Continue with Free Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🆓 Free Plan Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">You can still use CoinWayFinder with our free plan:</p>
              <ul className="text-sm space-y-1">
                <li>• 1 Trading Bot</li>
                <li>• 10 Trades/Month</li>
                <li>• Basic Strategies</li>
                <li>• Email Support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">❓ Have Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">We're here to help you make the right decision:</p>
              <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                <Link href="/support">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Ready to upgrade later? You can always change your plan from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
