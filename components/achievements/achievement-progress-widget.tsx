"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, ChevronRight } from "lucide-react"
import { AchievementBadge } from "./achievement-badge"
import type { UserAchievement, AchievementProgress } from "@/types/achievements"
import { ACHIEVEMENTS } from "@/lib/achievement-definitions"
import Link from "next/link"

interface AchievementProgressWidgetProps {
  userId: string
  compact?: boolean
}

export function AchievementProgressWidget({ userId, compact = false }: AchievementProgressWidgetProps) {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [progress, setProgress] = useState<AchievementProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [achievementsResponse, progressResponse] = await Promise.all([
        fetch(`/api/achievements/user?userId=${userId}`),
        fetch(`/api/achievements/progress?userId=${userId}`),
      ])

      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        setUserAchievements(achievementsData.achievements || [])
      }

      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setProgress(progressData.progress)
      }
    } catch (error) {
      console.error("Failed to fetch achievement data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimReward = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className={compact ? "h-48" : ""}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    )
  }

  const recentAchievements = userAchievements
    .filter((ua) => ua.isCompleted)
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, compact ? 3 : 5)

  const unclaimedCount = userAchievements.filter((ua) => ua.isCompleted && !ua.isClaimed).length
  const completedCount = userAchievements.filter((ua) => ua.isCompleted).length
  const totalCount = ACHIEVEMENTS.filter((a) => !a.isHidden).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
            {!compact && (
              <CardDescription>
                Level {progress?.level || 1} • {completedCount}/{totalCount} unlocked
              </CardDescription>
            )}
          </div>
          <Link href="/achievements">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Level Progress */}
        {!compact && progress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Level {progress.level}</span>
              <span className="text-sm text-gray-500">
                {progress.totalPoints} / {progress.nextLevelPoints} XP
              </span>
            </div>
            <Progress value={progress.currentLevelProgress} className="h-2" />
          </div>
        )}

        {/* Unclaimed Rewards Alert */}
        {unclaimedCount > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <Star className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              {unclaimedCount} reward{unclaimedCount > 1 ? "s" : ""} ready to claim!
            </span>
          </div>
        )}

        {/* Recent Achievements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Recent Achievements</h4>

          {recentAchievements.length > 0 ? (
            <div className="space-y-2">
              {recentAchievements.map((userAchievement) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === userAchievement.achievementId)
                if (!achievement) return null

                return (
                  <div
                    key={userAchievement.achievementId}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <AchievementBadge
                      achievement={achievement}
                      userAchievement={userAchievement}
                      size="sm"
                      showProgress={false}
                      onClaim={handleClaimReward}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{achievement.name}</h5>
                      <p className="text-xs text-gray-600 truncate">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} XP
                        </Badge>
                        {!userAchievement.isClaimed && achievement.rewards && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Unclaimed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No achievements yet</p>
              <p className="text-xs">Start trading to earn your first achievement!</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!compact && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{progress?.level || 1}</div>
              <div className="text-xs text-gray-500">Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-500">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{progress?.totalPoints || 0}</div>
              <div className="text-xs text-gray-500">Total XP</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
