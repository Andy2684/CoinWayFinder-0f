"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Bot, TrendingUp, Settings, Newspaper, Menu, X, FishIcon as Whale } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { AdminDialog } from "@/components/admin/admin-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Trading Bots", href: "/bots", icon: Bot },
  { name: "News & Analysis", href: "/news", icon: Newspaper },
  { name: "Whale Tracking", href: "/whales", icon: Whale },
  { name: "Integrations", href: "/integrations", icon: Settings },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()
  const { isAdmin } = useAdmin()

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
              <span className="text-xl font-bold text-white">CoinWayFinder</span>
              {isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  ADMIN
                </Badge>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <>
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? "bg-[#30D5C8]/10 text-[#30D5C8]" : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Admin Access Button (subtle) */}
            <AdminDialog />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">Welcome, {user?.name || user?.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <AuthDialog />
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
              {isAuthenticated && (
                <>
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? "bg-[#30D5C8]/10 text-[#30D5C8]"
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
