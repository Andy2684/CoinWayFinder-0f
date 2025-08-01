"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Gift, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { RARITY_GRADIENTS } from "@/lib/achievement-definitions"
import type { Achievement } from "@/types/achievements"

interface AchievementNotificationProps {
  achievement: Achievement
  onDismiss: () => void
  onClaim?: () => void
  autoHide?: boolean
  duration?: number
}

export function AchievementNotification({
  achievement,
  onDismiss,
  onClaim,
  autoHide = true,
  duration = 5000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, duration])

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsAnimating(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, 300)
  }

  const handleClaim = () => {
    onClaim?.()
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card
        className={cn(
          "w-80 bg-gradient-to-br border-2 shadow-2xl transition-all duration-500",
          RARITY_GRADIENTS[achievement.rarity],
          isAnimating ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <h3 className="font-bold text-white text-sm">Achievement Unlocked!</h3>
                <div className="flex items-center gap-1">
                  {achievement.rarity === "legendary" && <Star className="w-3 h-3 text-yellow-300" />}
                  {achievement.rarity === "epic" && <Star className="w-3 h-3 text-purple-300" />}
                  <span className="text-xs text-white/80 capitalize">{achievement.rarity}</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white">{achievement.title}</h4>
              <p className="text-sm text-white/80">{achievement.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-yellow-200 font-semibold text-sm">+{achievement.points} points</div>

              {achievement.reward && onClaim && (
                <Button
                  size="sm"
                  onClick={handleClaim}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Gift className="w-3 h-3 mr-1" />
                  Claim Reward
                </Button>
              )}
            </div>

            {achievement.reward && (
              <div className="bg-white/10 p-2 rounded text-xs text-white/90">
                <strong>Reward:</strong> {achievement.reward.description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Achievement notification queue manager
export class AchievementNotificationManager {
  private queue: Achievement[] = []
  private isShowing = false
  private showCallback?: (achievement: Achievement) => void

  setShowCallback(callback: (achievement: Achievement) => void) {
    this.showCallback = callback
  }

  addNotification(achievement: Achievement) {
    this.queue.push(achievement)
    this.processQueue()
  }

  private async processQueue() {
    if (this.isShowing || this.queue.length === 0) return

    this.isShowing = true
    const achievement = this.queue.shift()!

    if (this.showCallback) {
      this.showCallback(achievement)

      // Wait for notification to be dismissed before showing next
      setTimeout(() => {
        this.isShowing = false
        this.processQueue()
      }, 5500) // Slightly longer than auto-hide duration
    }
  }
}

export const achievementNotificationManager = new AchievementNotificationManager()
