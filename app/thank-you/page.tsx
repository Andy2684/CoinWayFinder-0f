import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Bot, Zap } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Coinwayfinder!</CardTitle>
          <CardDescription className="text-lg">
            Your account has been created successfully. You're now ready to explore our crypto trading tools and
            signals.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Live Signals</h3>
              <p className="text-sm text-gray-600">Access real-time trading signals</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Bot className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Trading Bots</h3>
              <p className="text-sm text-gray-600">Explore automated trading strategies</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Live Demo</h3>
              <p className="text-sm text-gray-600">Try our platform features</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signals">Explore Signals</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/demo">Try Live Demo</Link>
            </Button>

            <Button asChild variant="ghost" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Ready to start trading? Check out our latest signals and market insights.
            </p>
            <Button asChild variant="link">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
