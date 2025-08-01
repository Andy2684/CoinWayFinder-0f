"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, Users } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface WelcomeStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function WelcomeStep({ onNext, isLoading }: WelcomeStepProps) {
  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Trading Tools",
      description: "Access professional-grade trading bots and analytics",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds and data are protected with enterprise security",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds across multiple exchanges",
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Learn from experienced traders and share strategies",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to CoinWayFinder!</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          You're about to join thousands of traders who use CoinWayFinder to maximize their crypto trading potential.
          Let's get you set up with everything you need to succeed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">
          This setup will take about 5 minutes and you can skip any step if needed.
        </p>
        <Button onClick={() => onNext()} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Loading..." : "Let's Get Started"}
        </Button>
      </div>
    </div>
  )
}
