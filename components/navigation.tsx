"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { AdminDialog } from "@/components/admin/admin-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import {
  Bot,
  BarChart3,
  Settings,
  Newspaper,
  User,
  LogOut,
  Crown,
  AlertTriangle,
  CheckCircle,
  Shield,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const { admin, isAdmin, signOut: adminSignOut } = useAdmin()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getSubscriptionBadge = () => {
    if (isAdmin) {
      return (
        <Badge variant="default" className="ml-2 bg-gradient-to-r from-red-500 to-orange-500">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      )
    }

    if (!user?.subscription) return null

    const { plan, status, endDate } = user.subscription
    const isExpired = status === "expired"
    const isExpiringSoon = new Date(endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    if (isExpired) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      )
    }

    if (isExpiringSoon && status === "active") {
      return (
        <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expires Soon
        </Badge>
      )
    }

    if (plan === "premium" || plan === "enterprise") {
      return (
        <Badge variant="default" className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
          <Crown className="w-3 h-3 mr-1" />
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="ml-2">
        <CheckCircle className="w-3 h-3 mr-1" />
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    )
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/bots", label: "Trading Bots", icon: Bot },
    { href: "/integrations", label: "Integrations", icon: Settings },
    { href: "/news", label: "News", icon: Newspaper },
  ]

  const handleSignOut = async () => {
    if (isAdmin) {
      await adminSignOut()
    } else {
      await signOut()
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <span className="font-bold text-xl">CoinWayFinder</span>
            </Link>

            {(user || isAdmin) && (
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user || isAdmin ? (
              <div className="flex items-center space-x-4">
                {getSubscriptionBadge()}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{isAdmin ? "A" : user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{isAdmin ? admin?.username : user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {isAdmin ? admin?.email : user?.email}
                        </p>
                        {isAdmin && (
                          <p className="text-xs text-red-600 font-medium">Admin Access - All Features Unlocked</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {!isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/subscription" className="flex items-center">
                            <Crown className="mr-2 h-4 w-4" />
                            Subscription
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AuthDialog defaultTab="signin">
                  <Button variant="ghost">Sign In</Button>
                </AuthDialog>
                <AuthDialog defaultTab="signup">
                  <Button>Get Started</Button>
                </AuthDialog>

                {/* Hidden Admin Access Button */}
                <AdminDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-20 hover:opacity-100 transition-opacity"
                    title="Admin Access"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </AdminDialog>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {(user || isAdmin) &&
                navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

              {!user && !isAdmin && (
                <div className="px-3 py-2 space-y-2">
                  <AuthDialog defaultTab="signin">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </AuthDialog>
                  <AuthDialog defaultTab="signup">
                    <Button className="w-full">Get Started</Button>
                  </AuthDialog>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
