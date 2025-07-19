import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription>
            Your account has been created successfully. You can now explore our platform and start your crypto trading
            journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What's next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Explore our trading signals and market analysis</li>
              <li>• Set up your trading bots and strategies</li>
              <li>• Connect your exchange accounts</li>
              <li>• Join our community of traders</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
