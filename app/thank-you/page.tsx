import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Mail } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Account Created Successfully!</CardTitle>
          <CardDescription className="text-gray-400">
            Welcome to CoinWayFinder! Your account has been created and you can now sign in to start trading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-white">Next Steps</h3>
                <p className="text-xs text-gray-400 mt-1">
                  You can now sign in to your account and start exploring our AI-powered trading platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Sign In to Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                Back to Homepage
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our{" "}
              <Link href="/support" className="text-blue-400 hover:text-blue-300 underline">
                support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
