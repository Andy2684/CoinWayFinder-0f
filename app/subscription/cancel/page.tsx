"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"
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
            <CardDescription>You cancelled the payment process before it was completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Still interested in upgrading?</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                You can try again anytime. Your account is still active with the free plan.
              </p>
              <Button asChild>
                <Link href="/subscription">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Plans
                </Link>
              </Button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <h3 className="font-semibold mb-2">
                <HelpCircle className="inline h-4 w-4 mr-1" />
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you experienced any issues during checkout, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Continue with Free Plan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">You can always upgrade later when you're ready.</p>
        </div>
      </div>
    </div>
  )
}
