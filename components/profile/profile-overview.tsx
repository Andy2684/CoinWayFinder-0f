"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuthContext } from "@/components/auth/auth-provider"
import {
  User,
  Mail,
  Calendar,
  Shield,
  TrendingUp,
  Bot,
  Zap,
  Award,
  Star,
  Activity,
  DollarSign,
  Target,
} from "lucide-react"

export function ProfileOverview() {
  const { user } = useAuthContext()

  const stats = [
    { label: "Active Bots", value: "12", icon: Bot, color: "text-blue-400" },
    { label: "Total Trades", value: "1,247", icon: TrendingUp, color: "text-green-400" },
    { label: "Signals Created", value: "89", icon: Zap, color: "text-yellow-400" },
    { label: "Portfolio Value", value: "$24,567", icon: DollarSign, color: "text-purple-400" },
  ]

  const achievements = [
    { name: "First Trade", description: "Completed your first trade", earned: true },
    { name: "Bot Master", description: "Created 10+ trading bots", earned: true },
    { name: "Signal Expert", description: "Generated 50+ signals", earned: true },
    { name: "Profit Maker", description: "Achieved 100% profit", earned: false },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" alt={user?.firstName || "User"} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                {user?.firstName?.[0]?.toUpperCase() || "U"}
                {user?.lastName?.[0]?.toUpperCase() || ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-300">@{user?.username || "username"}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  Pro Member
                </Badge>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                  Verified
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Email</span>
              </div>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Member Since</span>
              </div>
              <span className="text-white">January 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Security Level</span>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                High
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Last Active</span>
              </div>
              <span className="text-white">2 minutes ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription className="text-gray-400">Your trading milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${achievement.earned ? "bg-yellow-600/20" : "bg-gray-600/20"}`}>
                    <Star className={`h-4 w-4 ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{achievement.name}</p>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                {achievement.earned && (
                  <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription className="text-gray-400">Complete your profile to unlock all features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Profile Completion</span>
              <span className="text-white">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Complete these steps to reach 100%:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Add profile picture</li>
              <li>• Enable two-factor authentication</li>
              <li>• Connect at least one exchange</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
