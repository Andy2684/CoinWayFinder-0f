"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Zap, Target } from "lucide-react"
import type { UserProgress } from "@/types/gamification"

interface ProgressDisplayProps {
  userProgress: UserProgress | null
  className?: string
}

export function ProgressDisplay({ userProgress, className }: ProgressDisplayProps) {
  if (!userProgress) return null

  const unlockedAchievements = userProgress.achievements.filter((a) => a.unlockedAt)
  const progressPercent = (userProgress.currentLevelPoints / userProgress.nextLevelPoints) * 100

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-400 border-yellow-400"
      case "epic":
        return "text-purple-400 border-purple-400"
      case "rare":
        return "text-blue-400 border-blue-400"
      default:
        return "text-green-400 border-green-400"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-400/10"
      case "epic":
        return "bg-purple-400/10"
      case "rare":
        return "bg-blue-400/10"
      default:
        return "bg-green-400/10"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level and Points */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Level {userProgress.level}</span>
            </div>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              {userProgress.totalPoints} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress to Level {userProgress.level + 1}</span>
              <span className="text-gray-400">
                {userProgress.currentLevelPoints}/{userProgress.nextLevelPoints}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Recent Achievements</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {unlockedAchievements.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockedAchievements.slice(-3).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${getRarityColor(achievement.rarity)} ${getRarityBg(achievement.rarity)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-medium text-white">{achievement.title}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>+{achievement.points}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {userProgress.badges.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Star className="w-5 h-5 text-purple-400" />
              <span>Earned Badges</span>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                {userProgress.badges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userProgress.badges.map((badge) => (
                <Badge
                  key={badge.id}
                  className={`${
                    badge.color === "gold"
                      ? "bg-yellow-400/20 text-yellow-400 border-yellow-400"
                      : "bg-purple-400/20 text-purple-400 border-purple-400"
                  } px-3 py-1`}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(userProgress.milestones).map(([key, completed]) => (
              <div
                key={key}
                className={`p-2 rounded-lg border text-center ${
                  completed
                    ? "bg-green-400/10 border-green-400 text-green-400"
                    : "bg-gray-400/10 border-gray-600 text-gray-400"
                }`}
              >
                <div className="text-lg mb-1">{completed ? "✅" : "⏳"}</div>
                <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
