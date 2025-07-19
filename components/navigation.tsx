"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              CoinWayFinder
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/news"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                News
              </Link>
              <Link
                href="/signals"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Signals
              </Link>
              <Link
                href="/bots"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Bots
              </Link>
              <Link
                href="/portfolio"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Portfolio
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80 text-sm">Welcome, {user.firstName || user.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={logout} variant="ghost" size="sm" className="text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm" className="text-white">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
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
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/signals"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Signals
              </Link>
              <Link
                href="/bots"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Bots
              </Link>
              <Link
                href="/portfolio"
                className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>

              <div className="border-t border-white/20 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-white/80 px-3 py-2 text-sm">Welcome, {user.firstName || user.name}</div>
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full text-white"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" size="sm" className="w-full text-white">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
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
