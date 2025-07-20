import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription className="text-gray-400">
            Your account has been created successfully. You can now sign in and start trading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-gray-300">
            <p>✅ Account created</p>
            <p>✅ Email verification sent</p>
            <p>✅ Ready to start trading</p>
          </div>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Sign In Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
