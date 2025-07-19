import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Coinwayfinder!</CardTitle>
          <CardDescription>
            Your account has been successfully created. You can now sign in to access your trading dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>🎉 Account created successfully</p>
            <p>📧 Welcome email sent</p>
            <p>🚀 Ready to start trading</p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
