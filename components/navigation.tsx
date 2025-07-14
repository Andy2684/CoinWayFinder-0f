"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, TrendingUp, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Signals", href: "/signals" },
  { name: "Trading Bots", href: "/bots" },
  { name: "News", href: "/news" },
  { name: "Integrations", href: "/integrations" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-[#1A1B23] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-[#30D5C8]" />
              <span className="text-xl font-bold text-white">CoinWayfinder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-[#30D5C8] bg-[#30D5C8]/10"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-[#30D5C8] text-[#191A1E]">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden" size="sm">
                  <Menu className="h-6 w-6 text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[#1A1B23] border-gray-800">
                <div className="flex flex-col space-y-4 mt-4">
                  {isAuthenticated && user && (
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback className="bg-[#30D5C8] text-[#191A1E]">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {isAuthenticated ? (
                    <>
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? "text-[#30D5C8] bg-[#30D5C8]/10"
                              : "text-gray-300 hover:text-white hover:bg-gray-700"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-700 pt-4">
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">Sign Up</Button>
                      </Link>
                    </div>
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
