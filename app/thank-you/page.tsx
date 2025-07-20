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
          <CardTitle className="text-2xl font-bold text-white">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription className="text-gray-400">
            Your account has been successfully created. We're excited to have you on board!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Check your email</h3>
                <p className="text-sm text-gray-400">
                  We've sent you a verification email. Please click the link to verify your account.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-medium">What's next?</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Verify your email address</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Complete your profile setup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Explore our AI trading bots</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Start your trading journey</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Sign In to Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
