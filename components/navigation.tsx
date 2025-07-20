"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, TrendingUp } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">CoinWayFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              News
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={logout} variant="ghost" className="text-gray-300 hover:text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu} className="text-white hover:bg-white/10">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-md rounded-lg mt-2">
              <Link
                href="#features"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={toggleMenu}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={toggleMenu}
              >
                Pricing
              </Link>
              <Link
                href="/news"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={toggleMenu}
              >
                News
              </Link>

              {user ? (
                <>
                  <Link href="/dashboard" onClick={toggleMenu}>
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      logout()
                      toggleMenu()
                    }}
                    variant="ghost"
                    className="w-full mt-2 text-gray-300 hover:text-white"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link href="/auth/login" onClick={toggleMenu}>
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={toggleMenu}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
