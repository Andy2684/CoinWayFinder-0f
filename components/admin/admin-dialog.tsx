"use client"

import type React from "react"

import { useState } from "react"
import { Shield, Eye, EyeOff, Users, Activity, TrendingUp, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/hooks/use-admin"

export function AdminDialog() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const { admin, login, logout, loading, stats } = useAdmin()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(credentials.username, credentials.password)
  }

  if (admin) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
            <Shield className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-green-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Panel
            </DialogTitle>
            <DialogDescription className="text-gray-400">System administration and monitoring</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Admin Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-400">Administrator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white">{admin.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{admin.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <Badge className="bg-green-500/20 text-green-400">{admin.role}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-lg font-semibold text-white">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Active Bots</p>
                        <p className="text-lg font-semibold text-white">{stats.activeBots.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Trades</p>
                        <p className="text-lg font-semibold text-white">{stats.totalTrades.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Uptime</p>
                        <p className="text-lg font-semibold text-white">{stats.systemUptime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Admin Privileges */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-400">Admin Privileges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Unlimited Bots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Unlimited Trades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Whale Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">News Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">User Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">System Stats</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-400 opacity-50">
          <Shield className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter admin credentials to access system controls
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
