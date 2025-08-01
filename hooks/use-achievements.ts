"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Reward, UserProgress } from "@/types/gamification"

export function useAchievements() {
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const { toast } = useToast()

  const unlockAchievement = useCallback(
    async (achievementId: string, stepData?: any) => {
      try {
        const response = await fetch("/api/gamification/achievements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ achievementId, stepData }),
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentReward(data.reward)
          setNewLevel(data.newLevel)
          setUserProgress(data.updatedProgress)

          // Show toast for immediate feedback
          toast({
            title: "Achievement Unlocked! 🎉",
            description: `${data.achievement.title} - +${data.achievement.points} points`,
          })

          return data
        }
      } catch (error) {
        console.error("Failed to unlock achievement:", error)
      }
    },
    [toast],
  )

  const fetchUserProgress = useCallback(async () => {
    try {
      const response = await fetch("/api/gamification/achievements")
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
        return data
      }
    } catch (error) {
      console.error("Failed to fetch user progress:", error)
    }
  }, [])

  const clearReward = useCallback(() => {
    setCurrentReward(null)
    setNewLevel(null)
  }, [])

  return {
    currentReward,
    newLevel,
    userProgress,
    unlockAchievement,
    fetchUserProgress,
    clearReward,
  }
}
