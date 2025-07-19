"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, Settings, LogOut, TrendingUp } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="bg-[#0F1015] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
              <span className="text-xl font-bold text-white">CoinWayFinder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/signals" className="text-gray-300 hover:text-white transition-colors">
              Signals
            </Link>
            <Link href="/bots" className="text-gray-300 hover:text-white transition-colors">
              Bots
            </Link>
            <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">
              Portfolio
            </Link>
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              News
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-[#30D5C8] text-[#0F1015]">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1A1B23] border-gray-700" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-[#30D5C8] hover:bg-[#28B8AC] text-[#0F1015]">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1A1B23] border-t border-gray-800">
            <Link
              href="/signals"
              className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Signals
            </Link>
            <Link
              href="/bots"
              className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Bots
            </Link>
            <Link
              href="/portfolio"
              className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              href="/news"
              className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              News
            </Link>

            {user ? (
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center px-3 py-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-[#30D5C8] text-[#0F1015]">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#28B8AC] text-[#0F1015]">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
