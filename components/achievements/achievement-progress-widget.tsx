"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Star, ArrowRight } from "lucide-react"
import { AchievementBadge } from "./achievement-badge"
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievement-definitions"
import Link from "next/link"
import type { Achievement, UserAchievement, AchievementProgress } from "@/types/achievements"

export function AchievementProgressWidget() {
  const [progress, setProgress] = useState<AchievementProgress | null>(null)
  const [recentAchievements, setRecentAchievements] = useState<UserAchievement[]>([])
  const [nearCompletionAchievements, setNearCompletionAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [progressRes, achievementsRes] = await Promise.all([
        fetch("/api/achievements/progress"),
        fetch("/api/achievements/user"),
      ])

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgress(progressData)
      }

      if (achievementsRes.ok) {
        const userAchievements = await achievementsRes.json()

        // Get recent achievements (last 7 days)
        const recent = userAchievements
          .filter((ua: UserAchievement) => {
            const unlockDate = new Date(ua.unlockedAt)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return unlockDate >= sevenDaysAgo
          })
          .sort(
            (a: UserAchievement, b: UserAchievement) =>
              new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
          )
          .slice(0, 3)

        setRecentAchievements(recent)

        // Get achievements near completion (80%+ progress)
        const nearCompletion = ACHIEVEMENT_DEFINITIONS.filter((achievement) => {
          const userAchievement = userAchievements.find((ua: UserAchievement) => ua.achievementId === achievement.id)

          if (!userAchievement || achievement.type === "one_time") return false

          const progress = userAchievement.progress || 0
          const maxProgress = achievement.maxProgress || 1
          return progress / maxProgress >= 0.8 && progress / maxProgress < 1
        }).slice(0, 3)

        setNearCompletionAchievements(nearCompletion)
      }
    } catch (error) {
      console.error("Failed to fetch achievement data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="h-2 bg-slate-700 rounded"></div>
            <div className="flex gap-2">
              <div className="w-16 h-20 bg-slate-700 rounded"></div>
              <div className="w-16 h-20 bg-slate-700 rounded"></div>
              <div className="w-16 h-20 bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const level = progress?.level || 1
  const totalPoints = progress?.totalPoints || 0
  const nextLevelPoints = progress?.nextLevelPoints || 1000
  const currentLevelPoints = progress?.currentLevelPoints || 0
  const levelProgress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Achievements
          </div>
          <Link href="/achievements">
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Level {level}</span>
            </div>
            <span className="text-xs text-gray-400">
              {totalPoints}/{nextLevelPoints} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-gray-400">{nextLevelPoints - totalPoints} XP to next level</p>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Recent Unlocks</h4>
            <div className="flex gap-2">
              {recentAchievements.map((userAchievement) => {
                const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === userAchievement.achievementId)
                if (!achievement) return null

                return (
                  <AchievementBadge
                    key={userAchievement.achievementId}
                    achievement={achievement}
                    userAchievement={userAchievement}
                    size="sm"
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Near Completion */}
        {nearCompletionAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Almost There!</h4>
            <div className="flex gap-2">
              {nearCompletionAchievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{totalPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{progress?.totalAchievements || 0}</div>
            <div className="text-xs text-gray-400">Unlocked</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
