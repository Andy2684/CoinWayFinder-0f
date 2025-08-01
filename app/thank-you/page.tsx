"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.push("/onboarding")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Account Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Welcome to CoinWayFinder! Your account has been created and you're ready to start your crypto trading
            journey.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              🚀 You'll be automatically redirected to complete your profile setup in a few seconds...
            </p>
          </div>

          <Button onClick={() => router.push("/onboarding")} className="w-full bg-blue-600 hover:bg-blue-700">
            Continue Setup Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-gray-500">You can also access the setup later from your dashboard</p>
        </CardContent>
      </Card>
    </div>
  )
}
