"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Bot, User, Settings, LogOut, Crown, AlertTriangle } from "lucide-react"
import { AuthDialog } from "./auth/auth-dialog"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
  }

  const getSubscriptionBadge = () => {
    if (!user?.subscriptionStatus) return null

    const { isActive, plan, daysLeft } = user.subscriptionStatus

    if (!isActive) {
      return (
        <Badge variant="destructive" className="ml-2">
          Expired
        </Badge>
      )
    }

    if (daysLeft <= 3) {
      return (
        <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
          {daysLeft} days left
        </Badge>
      )
    }

    if (plan === "premium" || plan === "enterprise") {
      return <Badge className="ml-2 bg-purple-600">Pro</Badge>
    }

    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CoinWayFinder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/bots" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Bots
                </Link>
                <Link href="/integrations" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Integrations
                </Link>
                <Link href="/news" className="text-gray-700 hover:text-blue-600 transition-colors">
                  News
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground">
                            {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
                          </span>
                          {getSubscriptionBadge()}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {user.subscriptionStatus?.shouldDisconnect && (
                      <>
                        <DropdownMenuItem className="text-orange-600">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>Subscription Expired</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/subscription">
                        <Crown className="mr-2 h-4 w-4" />
                        <span>Subscription</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Pricing
                </Link>

                {!loading && (
                  <>
                    <AuthDialog defaultTab="signin">
                      <Button variant="ghost">Sign In</Button>
                    </AuthDialog>
                    <AuthDialog defaultTab="signup">
                      <Button>Get Started</Button>
                    </AuthDialog>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">
                          {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
                        </span>
                        {getSubscriptionBadge()}
                      </div>
                    </div>
                  </div>

                  <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/bots" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    My Bots
                  </Link>
                  <Link href="/integrations" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Integrations
                  </Link>
                  <Link href="/news" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    News
                  </Link>
                  <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Profile
                  </Link>
                  <Link href="/subscription" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Subscription
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Features
                  </Link>
                  <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Pricing
                  </Link>

                  {!loading && (
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
