"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, Lock, Gift, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { RARITY_COLORS, RARITY_GRADIENTS } from "@/lib/achievement-definitions"
import type { Achievement, UserAchievement } from "@/types/achievements"

interface AchievementBadgeProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  showProgress?: boolean
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onClaim?: (achievementId: string) => void
}

export function AchievementBadge({
  achievement,
  userAchievement,
  showProgress = true,
  size = "md",
  interactive = false,
  onClaim,
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false)

  const isUnlocked = !!userAchievement
  const isClaimed = userAchievement?.claimed || false
  const progress = userAchievement?.progress || achievement.progress || 0
  const maxProgress = achievement.maxProgress || 1
  const progressPercent = (progress / maxProgress) * 100

  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-20 h-24",
    lg: "w-24 h-28",
  }

  const iconSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const BadgeContent = () => (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-300",
        sizeClasses[size],
        isUnlocked
          ? `bg-gradient-to-br ${RARITY_GRADIENTS[achievement.rarity]} ${RARITY_COLORS[achievement.rarity]}`
          : "bg-gray-800 border-gray-600 text-gray-500",
        interactive && "hover:scale-105 cursor-pointer",
      )}
      onClick={interactive ? () => setShowDetails(!showDetails) : undefined}
    >
      {/* Achievement Icon */}
      <div className={cn("mb-1", iconSizes[size])}>{isUnlocked ? achievement.icon : "🔒"}</div>

      {/* Rarity Indicator */}
      <div className="absolute top-1 right-1">
        {achievement.rarity === "legendary" && <Star className="w-3 h-3 text-yellow-300" />}
        {achievement.rarity === "epic" && <Star className="w-3 h-3 text-purple-300" />}
      </div>

      {/* Status Indicator */}
      <div className="absolute top-1 left-1">
        {isUnlocked && isClaimed && <Check className="w-3 h-3 text-green-400" />}
        {isUnlocked && !isClaimed && achievement.reward && <Gift className="w-3 h-3 text-yellow-400 animate-pulse" />}
        {!isUnlocked && <Lock className="w-3 h-3 text-gray-500" />}
      </div>

      {/* Progress Bar for Progressive Achievements */}
      {showProgress && achievement.type !== "one_time" && (
        <div className="absolute bottom-1 left-1 right-1">
          <Progress value={progressPercent} className="h-1" />
        </div>
      )}
    </div>
  )

  if (!interactive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <BadgeContent />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="text-center">
              <h4 className="font-semibold">{achievement.title}</h4>
              <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="outline" className={RARITY_COLORS[achievement.rarity]}>
                  {achievement.rarity}
                </Badge>
                <span className="text-yellow-400">{achievement.points} pts</span>
              </div>
              {showProgress && achievement.type !== "one_time" && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400">
                    Progress: {progress}/{maxProgress}
                  </div>
                  <Progress value={progressPercent} className="h-1 mt-1" />
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div>
      <BadgeContent />

      {/* Detailed View Modal/Card */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-slate-800 border-slate-700">
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="text-xl font-bold text-white">{achievement.title}</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className={RARITY_COLORS[achievement.rarity]}>
                  {achievement.rarity}
                </Badge>
                <span className="text-yellow-400 font-semibold">{achievement.points} points</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-300 text-center">{achievement.description}</p>

              {/* Progress */}
              {showProgress && achievement.type !== "one_time" && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {progress}/{maxProgress}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}

              {/* Reward */}
              {achievement.reward && (
                <div className="bg-slate-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-1">Reward</h4>
                  <p className="text-xs text-gray-300">{achievement.reward.description}</p>
                </div>
              )}

              {/* Unlock Status */}
              <div className="text-center">
                {isUnlocked ? (
                  isClaimed ? (
                    <div className="text-green-400 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Claimed
                    </div>
                  ) : achievement.reward ? (
                    <Button
                      onClick={() => onClaim?.(achievement.id)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Claim Reward
                    </Button>
                  ) : (
                    <div className="text-green-400">Unlocked!</div>
                  )
                ) : (
                  <div className="text-gray-400 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Locked
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="border-slate-600 text-gray-300"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
