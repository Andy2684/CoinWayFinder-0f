"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Gift, Star, Trophy, Award } from "lucide-react"
import type { Achievement, UserAchievement } from "@/types/achievements"
import { RARITY_CONFIG } from "@/lib/achievement-definitions"
import { cn } from "@/lib/utils"

interface AchievementBadgeProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
  onClaim?: (achievementId: string) => void
}

export function AchievementBadge({
  achievement,
  userAchievement,
  size = "md",
  showProgress = true,
  onClaim,
}: AchievementBadgeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const rarity = RARITY_CONFIG[achievement.rarity]
  const isUnlocked = userAchievement?.isCompleted || false
  const isClaimed = userAchievement?.isClaimed || false
  const progress = userAchievement?.progress || 0
  const maxProgress = userAchievement?.maxProgress || 1
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0

  const sizeClasses = {
    sm: "w-16 h-16 text-2xl",
    md: "w-20 h-20 text-3xl",
    lg: "w-24 h-24 text-4xl",
  }

  const handleClaim = async () => {
    if (!onClaim || !isUnlocked || isClaimed) return

    setIsClaiming(true)
    try {
      await onClaim(achievement.id)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to claim achievement:", error)
    } finally {
      setIsClaiming(false)
    }
  }

  const BadgeContent = () => (
    <div
      className={cn(
        "relative rounded-lg border-2 transition-all duration-300 cursor-pointer",
        sizeClasses[size],
        isUnlocked
          ? `${rarity.borderColor} ${rarity.bgColor} hover:scale-105 shadow-lg`
          : "border-gray-200 bg-gray-50 opacity-60",
        !isUnlocked && "grayscale",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isUnlocked ? (
          <span className="text-center">{achievement.icon}</span>
        ) : (
          <Lock className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Rarity indicator */}
      <div className={cn("absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white", rarity.bgColor)}>
        {achievement.rarity === "legendary" && <Star className="w-2 h-2 text-yellow-600 m-0.5" />}
        {achievement.rarity === "epic" && <Trophy className="w-2 h-2 text-purple-600 m-0.5" />}
        {achievement.rarity === "rare" && <Award className="w-2 h-2 text-blue-600 m-0.5" />}
      </div>

      {/* Unclaimed reward indicator */}
      {isUnlocked && !isClaimed && achievement.rewards && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse">
          <Gift className="w-2 h-2 text-white m-0.5" />
        </div>
      )}

      {/* Progress indicator for progressive achievements */}
      {showProgress && !isUnlocked && achievement.type === "progressive" && (
        <div className="absolute -bottom-2 left-0 right-0">
          <Progress value={progressPercentage} className="h-1" />
        </div>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div>
                <BadgeContent />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl",
                      isUnlocked ? `${rarity.borderColor} ${rarity.bgColor}` : "border-gray-200 bg-gray-50 opacity-60",
                    )}
                  >
                    {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <DialogTitle className="text-left">{achievement.name}</DialogTitle>
                    <Badge variant="outline" className={cn("mt-1", rarity.color)}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="text-left">{achievement.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Progress */}
                {!isUnlocked && achievement.type === "progressive" && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {progress}/{maxProgress}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                {/* Points */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Points Reward</span>
                  <Badge variant="secondary">{achievement.points} XP</Badge>
                </div>

                {/* Rewards */}
                {achievement.rewards && achievement.rewards.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Rewards</h4>
                    <div className="space-y-2">
                      {achievement.rewards.map((reward, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Gift className="w-4 h-4 text-green-500" />
                          <span>{reward.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Claim button */}
                {isUnlocked && !isClaimed && achievement.rewards && (
                  <Button onClick={handleClaim} disabled={isClaiming} className="w-full">
                    {isClaiming ? "Claiming..." : "Claim Rewards"}
                  </Button>
                )}

                {/* Status */}
                <div className="text-center text-sm text-gray-500">
                  {!isUnlocked && "Not unlocked yet"}
                  {isUnlocked && !isClaimed && "Unlocked! Claim your rewards"}
                  {isUnlocked && isClaimed && `Claimed on ${userAchievement?.claimedAt?.toLocaleDateString()}`}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{achievement.name}</p>
            <p className="text-xs text-gray-400">{achievement.description}</p>
            {!isUnlocked && achievement.type === "progressive" && (
              <p className="text-xs mt-1">
                {progress}/{maxProgress}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
