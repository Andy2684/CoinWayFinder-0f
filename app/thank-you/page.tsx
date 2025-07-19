import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, TrendingUp } from "lucide-react"
import Navigation from "@/components/navigation"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#0F1015]">
      <Navigation />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto bg-[#1A1B23] border-gray-800">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome to CoinWayFinder!</CardTitle>
            <CardDescription className="text-gray-400">
              Your account has been created successfully. You can now sign in to access your trading dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <TrendingUp className="w-5 h-5 text-[#30D5C8]" />
                <span>Access AI-powered trading signals</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <TrendingUp className="w-5 h-5 text-[#30D5C8]" />
                <span>Create and manage trading bots</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <TrendingUp className="w-5 h-5 text-[#30D5C8]" />
                <span>Track your portfolio performance</span>
              </div>
            </div>

            <Link href="/auth/login" className="block">
              <Button className="w-full bg-[#30D5C8] hover:bg-[#28B8AC] text-[#0F1015]">
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-400 hover:text-white">
                Return to homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
