"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Star, Target, Flame, Users, Bot, BookOpen, TrendingUp } from "lucide-react"
import { AchievementBadge } from "./achievement-badge"
import { ACHIEVEMENT_DEFINITIONS, getAchievementsByCategory } from "@/lib/achievement-definitions"
import { useToast } from "@/hooks/use-toast"
import type { Achievement, UserAchievement, AchievementProgress } from "@/types/achievements"

export function AchievementDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENT_DEFINITIONS)
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [progress, setProgress] = useState<AchievementProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rarity")
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    fetchAchievementData()
  }, [])

  const fetchAchievementData = async () => {
    try {
      const [achievementsRes, progressRes] = await Promise.all([
        fetch("/api/achievements/user"),
        fetch("/api/achievements/progress"),
      ])

      if (achievementsRes.ok) {
        const userAchievementData = await achievementsRes.json()
        setUserAchievements(userAchievementData)
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgress(progressData)
      }
    } catch (error) {
      console.error("Failed to fetch achievement data:", error)
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimReward = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchAchievementData()
        toast({
          title: "Reward Claimed!",
          description: "Your achievement reward has been claimed successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      })
    }
  }

  const getFilteredAchievements = () => {
    let filtered = achievements

    if (selectedCategory !== "all") {
      filtered = getAchievementsByCategory(selectedCategory as Achievement["category"])
    }

    // Sort achievements
    filtered.sort((a, b) => {
      if (sortBy === "rarity") {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 }
        return rarityOrder[b.rarity] - rarityOrder[a.rarity]
      } else if (sortBy === "points") {
        return b.points - a.points
      } else if (sortBy === "progress") {
        const aProgress = userAchievements.find((ua) => ua.achievementId === a.id)
        const bProgress = userAchievements.find((ua) => ua.achievementId === b.id)
        if (aProgress && bProgress) {
          return bProgress.progress - aProgress.progress
        }
        return aProgress ? -1 : bProgress ? 1 : 0
      }
      return 0
    })

    return filtered
  }

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find((ua) => ua.achievementId === achievementId)
  }

  const unlockedCount = userAchievements.filter((ua) => !!ua).length
  const totalPoints = progress?.totalPoints || 0
  const level = progress?.level || 1
  const nextLevelPoints = progress?.nextLevelPoints || 100
  const currentLevelPoints = progress?.currentLevelPoints || 0
  const levelProgress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100

  const categoryIcons = {
    trading: TrendingUp,
    learning: BookOpen,
    social: Users,
    portfolio: Target,
    bot: Bot,
    milestone: Trophy,
    streak: Flame,
    special: Star,
  }

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Level {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-blue-200">
                <span>Progress to Level {level + 1}</span>
                <span>
                  {totalPoints}/{nextLevelPoints}
                </span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-blue-200">{nextLevelPoints - totalPoints} points to next level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-100">{totalPoints.toLocaleString()}</div>
            <p className="text-sm text-yellow-200">Lifetime earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-100">
              {unlockedCount}/{achievements.length}
            </div>
            <p className="text-sm text-green-200">
              {Math.round((unlockedCount / achievements.length) * 100)}% Complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Browser */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white">Achievement Gallery</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Category" />
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {getFilteredAchievements().map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={getUserAchievement(achievement.id)}
                    interactive={true}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-3">
                {getFilteredAchievements().map((achievement) => {
                  const userAchievement = getUserAchievement(achievement.id)
                  const isUnlocked = !!userAchievement
                  const progress = userAchievement?.progress || 0
                  const maxProgress = achievement.maxProgress || 1

                  return (
                    <Card key={achievement.id} className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <AchievementBadge
                            achievement={achievement}
                            userAchievement={userAchievement}
                            size="sm"
                            showProgress={false}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{achievement.title}</h4>
                              <Badge variant="outline" className={`text-xs`}>
                                {achievement.rarity}
                              </Badge>
                              <span className="text-yellow-400 text-sm">{achievement.points} pts</span>
                            </div>

                            <p className="text-gray-300 text-sm mb-2">{achievement.description}</p>

                            {achievement.type !== "one_time" && (
                              <div className="flex items-center gap-2">
                                <Progress value={(progress / maxProgress) * 100} className="h-2 flex-1" />
                                <span className="text-xs text-gray-400">
                                  {progress}/{maxProgress}
                                </span>
                              </div>
                            )}
                          </div>

                          {isUnlocked && !userAchievement?.claimed && achievement.reward && (
                            <Button
                              size="sm"
                              onClick={() => handleClaimReward(achievement.id)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500"
                            >
                              Claim
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
