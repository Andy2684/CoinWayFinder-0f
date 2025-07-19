import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, TrendingUp } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Coinwayfinder!</CardTitle>
          <CardDescription className="text-base">
            Your account has been successfully created. You can now sign in and start exploring our advanced trading
            platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What's next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Explore our AI-powered trading signals
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Set up automated trading bots
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Connect your exchange accounts
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
