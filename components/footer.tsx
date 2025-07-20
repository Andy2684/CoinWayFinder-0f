"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, LogIn, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { user } = useAuth()

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">CoinWayFinder</h3>
            <p className="text-gray-400">Advanced crypto trading platform powered by AI technology.</p>
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 mb-16 backdrop-blur-lg border border-white/10">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Stay Updated with Market Insights</h3>
                <p className="text-gray-300 mb-6">
                  Get the latest crypto market analysis, trading tips, and platform updates delivered straight to your
                  inbox.
                </p>

                {!isSubscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto mb-6">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="text-green-400 mb-6 flex items-center justify-center gap-2">
                    ✓ Thanks for subscribing! Check your email for confirmation.
                  </div>
                )}

                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/auth/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Free Account
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="text-white border-white/20 hover:bg-white/10 bg-transparent"
                    >
                      <Link href="/auth/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/signals" className="text-gray-400 hover:text-white">
                  Trading Signals
                </Link>
              </li>
              <li>
                <Link href="/bots" className="text-gray-400 hover:text-white">
                  AI Bots
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white">
                  Market News
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2024 CoinWayFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
