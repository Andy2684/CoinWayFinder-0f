"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Users, Activity, TrendingUp, Database } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AdminDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)

  const { admin, login, logout, systemStats, users } = useAdmin()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(credentials.username, credentials.password)
      setCredentials({ username: "", password: "" })
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  if (admin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-[#30D5C8] hover:text-[#30D5C8]/80">
            <Shield className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#30D5C8]" />
              Admin Dashboard
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Admin Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-muted-foreground">{admin.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <Badge variant="secondary">{admin.role}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Access Level</Label>
                    <Badge className="bg-[#30D5C8] text-black">Unlimited</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {admin.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Stats */}
            {systemStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-[#30D5C8]" />
                      <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-[#30D5C8]" />
                      <p className="text-2xl font-bold">{systemStats.activeBots}</p>
                      <p className="text-sm text-muted-foreground">Active Bots</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#30D5C8]" />
                      <p className="text-2xl font-bold">{systemStats.totalTrades}</p>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                    </div>
                    <div className="text-center">
                      <Database className="w-8 h-8 mx-auto mb-2 text-[#30D5C8]" />
                      <p className="text-2xl font-bold">{systemStats.systemUptime}</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Management */}
            {users && users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.botsCount} bots • {user.tradesCount} trades
                          </p>
                        </div>
                        <Badge variant={user.subscription === "admin" ? "default" : "secondary"}>
                          {user.subscription}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={handleLogout} variant="outline">
                Logout
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
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300 opacity-50">
          <Shield className="w-4 h-4" />
        </DialogTrigger>
      </DialogContent>
    </Dialog>
  )
}
