"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, MessageCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function SubscriptionCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="text-orange-500 text-6xl mb-4">
            <XCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Subscription Cancelled</h1>
          <p className="text-lg text-muted-foreground">Your payment was cancelled and no charges were made</p>
        </div>

        {/* What Happened */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>You cancelled the payment process before completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">No Payment Processed</h4>
              <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                <li>• Your card was not charged</li>
                <li>• No subscription was created</li>
                <li>• Your account remains on the free plan</li>
                <li>• You can try again anytime</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Try Again */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ready to try again?</CardTitle>
            <CardDescription>Choose a plan that works best for your trading needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl mb-2">🔵</div>
                <h4 className="font-semibold mb-1">Starter Plan</h4>
                <p className="text-2xl font-bold mb-2">
                  $29<span className="text-sm font-normal">/month</span>
                </p>
                <Button size="sm" asChild>
                  <Link href="/subscription">Choose Plan</Link>
                </Button>
              </div>

              <div className="p-4 border-2 border-primary rounded-lg text-center">
                <div className="text-2xl mb-2">🟡</div>
                <h4 className="font-semibold mb-1">Pro Trader</h4>
                <p className="text-2xl font-bold mb-2">
                  $79<span className="text-sm font-normal">/month</span>
                </p>
                <Button size="sm" asChild>
                  <Link href="/subscription">Choose Plan</Link>
                </Button>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl mb-2">🔴</div>
                <h4 className="font-semibold mb-1">Enterprise</h4>
                <p className="text-2xl font-bold mb-2">
                  $199<span className="text-sm font-normal">/month</span>
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/subscription">Choose Plan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Payment Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🪙 Try Crypto Payment</CardTitle>
            <CardDescription>Pay with Bitcoin, Ethereum, or other cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg mb-4">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Crypto Payment Benefits</h4>
              <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                <li>• No credit card required</li>
                <li>• Secure blockchain payments</li>
                <li>• Support for Bitcoin, Ethereum, USDC</li>
                <li>• No chargebacks or payment disputes</li>
              </ul>
            </div>
            <Button
              className="w-full"
              onClick={() =>
                window.open("https://commerce.coinbase.com/checkout/d8e91b96-8299-4b72-a9ed-77981687a3cc", "_blank")
              }
            >
              🪙 Pay with Cryptocurrency
            </Button>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Our team is here to assist you with any questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="mailto:support@coinwayfinder.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://t.me/coinwayfinder" target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Telegram Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Plans */}
        <div className="text-center mt-8">
          <Button variant="ghost" asChild>
            <Link href="/subscription">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing Plans
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
