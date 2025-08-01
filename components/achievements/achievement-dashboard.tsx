"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Star, Award, Filter } from "lucide-react"
import { AchievementBadge } from "./achievement-badge"
import type { UserAchievement, AchievementProgress } from "@/types/achievements"
import { ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/achievement-definitions"

interface AchievementDashboardProps {
  userId: string
}

export function AchievementDashboard({ userId }: AchievementDashboardProps) {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [progress, setProgress] = useState<AchievementProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
    fetchProgress()
  }, [userId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements/user?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/achievements/progress?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error)
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
        await fetchAchievements()
        await fetchProgress()
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
    }
  }

  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const categoryMatch = selectedCategory === "all" || achievement.category === selectedCategory
    const rarityMatch = selectedRarity === "all" || achievement.rarity === selectedRarity
    return categoryMatch && rarityMatch && !achievement.isHidden
  })

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find((ua) => ua.achievementId === achievementId)
  }

  const completedCount = userAchievements.filter((ua) => ua.isCompleted).length
  const totalCount = ACHIEVEMENTS.filter((a) => !a.isHidden).length
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const unclaimedRewards = userAchievements.filter((ua) => ua.isCompleted && !ua.isClaimed).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.level || 1}</div>
            <Progress value={progress?.currentLevelProgress || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progress?.totalPoints || 0} / {progress?.nextLevelPoints || 1000} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{completionRate.toFixed(1)}% Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{unclaimedRewards}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {unclaimedRewards > 0 ? "Click achievements to claim!" : "All rewards claimed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Rarity</label>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Gallery</CardTitle>
          <CardDescription>Unlock achievements by trading, learning, and engaging with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                userAchievement={getUserAchievement(achievement.id)}
                size="md"
                onClaim={handleClaimReward}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-8 text-gray-500">No achievements found with the selected filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userAchievements
              .filter((ua) => ua.isCompleted)
              .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
              .slice(0, 5)
              .map((userAchievement) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === userAchievement.achievementId)
                if (!achievement) return null

                return (
                  <div
                    key={userAchievement.achievementId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-400">
                        Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={RARITY_CONFIG[achievement.rarity].color}>
                      +{achievement.points} XP
                    </Badge>
                  </div>
                )
              })}

            {userAchievements.filter((ua) => ua.isCompleted).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No achievements unlocked yet. Start trading to earn your first achievement!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
