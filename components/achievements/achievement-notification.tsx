"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Trophy } from "lucide-react"
import type { Achievement } from "@/types/achievements"
import { RARITY_CONFIG } from "@/lib/achievement-definitions"
import { cn } from "@/lib/utils"

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
  onClaim?: () => void
  autoClose?: boolean
  duration?: number
}

export function AchievementNotification({
  achievement,
  onClose,
  onClaim,
  autoClose = true,
  duration = 5000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)

    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => {
        clearTimeout(timer)
        clearTimeout(closeTimer)
      }
    }

    return () => clearTimeout(timer)
  }, [autoClose, duration])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleClaim = () => {
    if (onClaim) {
      onClaim()
    }
    handleClose()
  }

  const rarity = RARITY_CONFIG[achievement.rarity]

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300 transform",
        isVisible && !isClosing ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <Card
        className={cn(
          "w-80 shadow-lg border-2 animate-bounce",
          rarity.borderColor,
          "bg-gradient-to-r from-white to-gray-50",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Achievement Icon */}
            <div
              className={cn(
                "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl flex-shrink-0",
                rarity.borderColor,
                rarity.bgColor,
              )}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Achievement Unlocked!</span>
              </div>

              <h3 className="font-bold text-gray-900 truncate">{achievement.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{achievement.description}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={rarity.color}>
                  {achievement.rarity.toUpperCase()}
                </Badge>
                <Badge variant="secondary">+{achievement.points} XP</Badge>
              </div>

              {/* Rewards */}
              {achievement.rewards && achievement.rewards.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Gift className="w-3 h-3" />
                    <span>Rewards available!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button variant="ghost" size="sm" onClick={handleClose} className="flex-shrink-0 h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          {achievement.rewards && achievement.rewards.length > 0 && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleClaim} className="flex-1 bg-green-600 hover:bg-green-700">
                <Gift className="w-4 h-4 mr-1" />
                Claim Rewards
              </Button>
            </div>
          )}
        </CardContent>

        {/* Rarity Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg opacity-20 animate-pulse",
            achievement.rarity === "legendary" && "bg-gradient-to-r from-yellow-400 to-orange-400",
            achievement.rarity === "epic" && "bg-gradient-to-r from-purple-400 to-pink-400",
            achievement.rarity === "rare" && "bg-gradient-to-r from-blue-400 to-cyan-400",
          )}
        />
      </Card>
    </div>
  )
}

// Notification Manager Component
interface AchievementNotificationManagerProps {
  userId: string
}

export function AchievementNotificationManager({ userId }: AchievementNotificationManagerProps) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      achievement: Achievement
    }>
  >([])

  useEffect(() => {
    // Listen for achievement unlock events
    const handleAchievementUnlock = (event: CustomEvent) => {
      const { achievement } = event.detail
      addNotification(achievement)
    }

    window.addEventListener("achievementUnlocked", handleAchievementUnlock as EventListener)

    return () => {
      window.removeEventListener("achievementUnlocked", handleAchievementUnlock as EventListener)
    }
  }, [])

  const addNotification = (achievement: Achievement) => {
    const id = `${achievement.id}-${Date.now()}`
    setNotifications((prev) => [...prev, { id, achievement }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClaim = async (achievementId: string, notificationId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        // Trigger a custom event to update other components
        window.dispatchEvent(
          new CustomEvent("achievementClaimed", {
            detail: { achievementId },
          }),
        )
      }
    } catch (error) {
      console.error("Failed to claim achievement:", error)
    } finally {
      removeNotification(notificationId)
    }
  }

  return (
    <>
      {notifications.map(({ id, achievement }) => (
        <AchievementNotification
          key={id}
          achievement={achievement}
          onClose={() => removeNotification(id)}
          onClaim={achievement.rewards?.length ? () => handleClaim(achievement.id, id) : undefined}
        />
      ))}
    </>
  )
}
