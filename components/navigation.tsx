"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Settings, BarChart3, Bot, Zap, Wallet, TrendingUp } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ]

  const dashboardItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/ai-bots", label: "AI Bots", icon: Bot },
    { href: "/signals", label: "Signals", icon: Zap },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/market-analysis", label: "Market", icon: TrendingUp },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CW</span>
            </div>
            <span className="text-xl font-bold text-white">CoinWayFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {dashboardItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Sign Up</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.firstName || "User"} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10" align="end">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-black/95 backdrop-blur-xl border-white/10">
                <div className="flex flex-col space-y-4 mt-8">
                  {!isAuthenticated ? (
                    <>
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="text-gray-300 hover:text-white transition-colors py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="pt-4 space-y-2">
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                            <User className="h-4 w-4 mr-2" />
                            Log In
                          </Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.firstName || "User"} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                        </div>
                      </div>
                      {dashboardItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                      <div className="pt-4 border-t border-white/10">
                        <Button
                          variant="ghost"
                          className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
