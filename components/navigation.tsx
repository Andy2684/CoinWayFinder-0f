"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Menu, X, User, LogOut, Settings, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navigation() {
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-blue-200 transition-colors">
              CoinWayFinder
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/news"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
              >
                News
              </Link>
              <Link
                href="/signals"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
              >
                Signals
              </Link>
              <Link
                href="/bots"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
              >
                Bots
              </Link>
              <Link
                href="/ai-bots"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
              >
                AI Bots
              </Link>
              <Link
                href="/portfolio"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
              >
                Portfolio
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.email} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {(user.name || user.email)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm" className="text-white hover:text-blue-200 hover:bg-white/10">
                  <Link href="/auth/login">
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/10 backdrop-blur-md rounded-lg mt-2">
              <Link
                href="/news"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/signals"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Signals
              </Link>
              <Link
                href="/bots"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Bots
              </Link>
              <Link
                href="/ai-bots"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Bots
              </Link>
              <Link
                href="/portfolio"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>

              <div className="border-t border-white/20 pt-4">
                {isLoading ? (
                  <div className="px-3 py-2">
                    <div className="w-full h-8 rounded bg-white/20 animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="text-white/80 px-3 py-2 text-sm">Welcome, {user.name || user.email}</div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                    >
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="w-full text-white hover:bg-white/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" size="sm" className="w-full text-white hover:bg-white/10">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
