import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Users, Shield, Zap } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Coinwayfinder!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for joining our community of smart crypto traders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Link href="/auth/login">Sign In to Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Explore Platform</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Advanced Trading Signals</CardTitle>
                <CardDescription>Get real-time trading signals powered by AI and technical analysis</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Automated Trading Bots</CardTitle>
                <CardDescription>Set up intelligent bots to trade 24/7 based on your strategies</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Advanced portfolio protection with stop-loss and risk controls</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Community Insights</CardTitle>
                <CardDescription>Learn from experienced traders and share your strategies</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>Comprehensive market analysis and portfolio tracking tools</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>Bank-level security with 99.9% uptime guarantee</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">What's Next?</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Here's how to get the most out of your Coinwayfinder experience:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Sign In</h4>
                    <p className="text-green-700 dark:text-green-300">Use your credentials to access your dashboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Explore Features</h4>
                    <p className="text-green-700 dark:text-green-300">
                      Check out our trading signals, bots, and analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Start Trading</h4>
                    <p className="text-green-700 dark:text-green-300">
                      Connect your exchange and begin automated trading
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
