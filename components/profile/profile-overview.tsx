"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthContext } from "@/components/auth/auth-provider"
import {
  User,
  Bot,
  TrendingUp,
  Signal,
  Wallet,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star,
  Calendar,
  MapPin,
} from "lucide-react"

export function ProfileOverview() {
  const { user } = useAuthContext()

  const stats = [
    { label: "Active Bots", value: "12", icon: Bot, color: "text-blue-500" },
    { label: "Total Trades", value: "1,247", icon: TrendingUp, color: "text-green-500" },
    { label: "Signals Created", value: "89", icon: Signal, color: "text-purple-500" },
    { label: "Portfolio Value", value: "$24,567", icon: Wallet, color: "text-yellow-500" },
  ]

  const achievements = [
    { name: "First Trade", description: "Completed your first trade", earned: true },
    { name: "Bot Master", description: "Created 10+ trading bots", earned: true },
    { name: "Signal Expert", description: "Generated 50+ signals", earned: true },
    { name: "Profit Maker", description: "Achieved 100% profit", earned: false },
  ]

  const profileCompletion = 85

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" alt={user?.firstName} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-400">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user?.isVerified ? "default" : "secondary"} className="flex items-center gap-1">
                  {user?.isVerified ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {user?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {user?.plan} Plan
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Joined Dec 2023</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>New York, USA</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="h-4 w-4" />
              <span>{user?.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Star className="h-4 w-4" />
              <span>4.8 Rating</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Completion */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Profile Completion</CardTitle>
          <CardDescription>Complete your profile to unlock all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-medium text-white">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Basic information added</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Email verified</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Trading preferences set</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span>Add profile picture</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <CardDescription>Your trading milestones and accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.earned
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-slate-700/50 border-slate-600 text-gray-400"
                }`}
              >
                <Trophy className={`h-6 w-6 ${achievement.earned ? "text-yellow-500" : "text-gray-500"}`} />
                <div>
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-xs opacity-80">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
