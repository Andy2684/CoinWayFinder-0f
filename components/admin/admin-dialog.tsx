"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, EyeOff, Users, Bot, BarChart3, Settings } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

export function AdminDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)

  const { admin, signIn, signOut, isAdmin } = useAdmin()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await signIn(credentials.username, credentials.password)
      if (success) {
        setIsOpen(false)
        setCredentials({ username: "", password: "" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (isAdmin && admin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
            <Badge variant="destructive" className="ml-2 text-xs">
              ADMIN
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-400">
              <Shield className="w-5 h-5 mr-2" />
              Admin Control Panel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Admin Info */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-red-400">Admin Session Active</h3>
                <Badge variant="destructive">SUPER ADMIN</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Username</p>
                  <p className="text-white">{admin.username}</p>
                </div>
                <div>
                  <p className="text-gray-400">Role</p>
                  <p className="text-white">{admin.role}</p>
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">1,247</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <Bot className="w-6 h-6 text-[#30D5C8] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-xs text-gray-400">Active Bots</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">15.6K</p>
                <p className="text-xs text-gray-400">Total Trades</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <Settings className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">ONLINE</p>
                <p className="text-xs text-gray-400">System Status</p>
              </div>
            </div>

            {/* Admin Privileges */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-400 mb-3">🔓 Admin Privileges Active</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Unlimited Bots
                </div>
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Unlimited Trades
                </div>
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  All Premium Features
                </div>
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Whale Tracking
                </div>
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  AI Analysis
                </div>
                <div className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  User Management
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Close Panel
              </Button>
              <Button variant="destructive" onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">
                Sign Out Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-30 hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
        >
          <Shield className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-400">
            <Shield className="w-5 h-5 mr-2" />
            Admin Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Label htmlFor="admin-username" className="text-gray-300">
              Admin Username
            </Label>
            <Input
              id="admin-username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter admin username"
              required
            />
          </div>

          <div>
            <Label htmlFor="admin-password" className="text-gray-300">
              Admin Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white pr-10"
                placeholder="Enter admin password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">⚠️ Admin access grants unlimited system privileges</p>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
