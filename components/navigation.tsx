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
import { useAuthContext } from "@/components/auth/auth-provider"
import { Menu, User, LogOut, Settings, BarChart3, Bot, Zap, TrendingUp, Newspaper, Wallet } from "lucide-react"

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const dashboardItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "AI Bots", href: "/ai-bots", icon: Bot },
  { name: "Signals", href: "/signals", icon: Zap },
  { name: "Portfolio", href: "/portfolio", icon: TrendingUp },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Integrations", href: "/integrations", icon: Wallet },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout, isLoading } = useAuthContext()

  const handleLogout = async () => {
    await logout()
  }

  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/ai-bots") ||
    pathname?.startsWith("/signals") ||
    pathname?.startsWith("/portfolio") ||
    pathname?.startsWith("/news") ||
    pathname?.startsWith("/integrations")

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CoinWayFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {dashboardItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive ? "bg-blue-500/20 text-blue-400" : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
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
                      <AvatarImage src={user?.firstName ? `/placeholder-user.jpg` : undefined} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || "User"}
                      </p>
                      <p className="w-[200px] truncate text-sm text-gray-400">{user?.email}</p>
                    </div>
                  </div>
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
                          key={item.name}
                          href={item.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200 py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="flex flex-col space-y-2 pt-4">
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
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
                          <AvatarImage src={user?.firstName ? `/placeholder-user.jpg` : undefined} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.username || "User"}
                          </p>
                          <p className="text-sm text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      {dashboardItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                              isActive
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 mt-4"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log out
                      </Button>
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
