import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription className="text-gray-300">Your account has been created successfully</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>Check your email to verify your account</span>
            </div>

            <p className="text-sm text-gray-400">
              We've sent you a verification link. Please check your inbox and click the link to activate your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              <Link href="/auth/login">
                Sign In to Your Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs text-gray-400">
              Didn't receive the email? Check your spam folder or{" "}
              <Link href="/auth/resend-verification" className="text-blue-400 hover:text-blue-300">
                resend verification
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
