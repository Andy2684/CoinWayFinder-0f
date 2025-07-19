import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="w-full max-w-md px-4">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to Coinwayfinder!</CardTitle>
              <CardDescription>
                Your account has been created successfully. You can now sign in to access your trading dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>🚀 Access advanced trading signals</p>
                <p>🤖 Create automated trading bots</p>
                <p>📊 Track your portfolio performance</p>
                <p>📰 Stay updated with crypto news</p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    Sign In to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
