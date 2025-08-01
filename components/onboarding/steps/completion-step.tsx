"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Bot, Bell, Link2 } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"
import { useAchievements } from "@/hooks/use-achievements"
import { Badge } from "@/components/ui/badge"

interface CompletionStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function CompletionStep({ data, onNext, isLoading }: CompletionStepProps) {
  const { userProgress } = useAchievements()

  const completedFeatures = [
    {
      icon: CheckCircle,
      title: "Profile Setup Complete",
      description: `Welcome, ${data?.profile?.firstName || "Trader"}! Your profile is ready.`,
      isCompleted: true,
    },
    {
      icon: TrendingUp,
      title: "Trading Experience Configured",
      description: `Set up for ${data?.tradingExperience?.level || "beginner"} level trading`,
      isCompleted: true,
    },
    {
      icon: Bell,
      title: "Notifications Configured",
      description: "Your notification preferences have been saved",
      isCompleted: true,
    },
    {
      icon: Link2,
      title: "Exchange Connections",
      description: data?.exchanges?.connectedExchanges?.length
        ? `${data.exchanges.connectedExchanges.length} exchange(s) selected for connection`
        : "Ready to connect exchanges when you're ready",
      isCompleted: true,
    },
  ]

  const nextSteps = [
    {
      icon: Bot,
      title: "Explore Trading Bots",
      description: "Discover automated trading strategies tailored to your experience level",
      action: "View Bots",
    },
    {
      icon: TrendingUp,
      title: "Analyze Markets",
      description: "Access real-time market data and advanced charting tools",
      action: "Market Analysis",
    },
    {
      icon: Link2,
      title: "Connect APIs",
      description: "Set up API connections to start automated trading",
      action: "Connect Now",
    },
  ]

  const handleComplete = () => {
    onNext({
      completedAt: new Date(),
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">🎉 Welcome to CoinWayFinder!</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Congratulations! You've successfully completed the onboarding process. Your account is now set up and ready
          for advanced crypto trading.
        </p>
      </div>

      {/* Completed Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">✅ What You've Accomplished</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedFeatures.map((feature, index) => (
            <Card key={index} className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">{feature.title}</h4>
                    <p className="text-sm text-green-300">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements Summary */}
      {userProgress && userProgress.achievements.filter((a) => a.unlockedAt).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">🏆 Achievements Unlocked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userProgress.achievements
              .filter((a) => a.unlockedAt)
              .map((achievement, index) => (
                <Card
                  key={index}
                  className={`${
                    achievement.rarity === "legendary"
                      ? "bg-yellow-400/10 border-yellow-400/20"
                      : achievement.rarity === "epic"
                        ? "bg-purple-400/10 border-purple-400/20"
                        : achievement.rarity === "rare"
                          ? "bg-blue-400/10 border-blue-400/20"
                          : "bg-green-400/10 border-green-400/20"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            achievement.rarity === "legendary"
                              ? "text-yellow-400"
                              : achievement.rarity === "epic"
                                ? "text-purple-400"
                                : achievement.rarity === "rare"
                                  ? "text-blue-400"
                                  : "text-green-400"
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                      <Badge
                        className={`${
                          achievement.rarity === "legendary"
                            ? "bg-yellow-400/20 text-yellow-400"
                            : achievement.rarity === "epic"
                              ? "bg-purple-400/20 text-purple-400"
                              : achievement.rarity === "rare"
                                ? "bg-blue-400/20 text-blue-400"
                                : "bg-green-400/20 text-green-400"
                        }`}
                      >
                        +{achievement.points}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">🚀 Recommended Next Steps</h3>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <Card key={index} className="bg-slate-700/50 border-slate-600 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-300">{step.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                  >
                    {step.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Account Summary */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Your CoinWayFinder Account</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{userProgress?.level || 1}</p>
                <p className="text-sm text-gray-400">Level</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{userProgress?.totalPoints || 0}</p>
                <p className="text-sm text-gray-400">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {userProgress?.achievements.filter((a) => a.unlockedAt).length || 0}
                </p>
                <p className="text-sm text-gray-400">Achievements</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{userProgress?.badges.length || 0}</p>
                <p className="text-sm text-gray-400">Badges</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.exchanges?.connectedExchanges?.length || 0}</p>
                <p className="text-sm text-gray-400">Exchanges</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          size="lg"
          className="bg-green-600 hover:bg-green-700 px-12"
        >
          {isLoading ? "Completing Setup..." : "Enter Dashboard"}
        </Button>
        <p className="text-sm text-gray-400 mt-2">
          You can always update your preferences later in your account settings
        </p>
      </div>
    </div>
  )
}
