"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function CTASection() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-12 bg-gray-700 rounded mb-6 mx-auto max-w-2xl animate-pulse"></div>
          <div className="h-6 bg-gray-700 rounded mb-8 mx-auto max-w-3xl animate-pulse"></div>
          <div className="h-12 w-48 bg-gray-700 rounded mx-auto animate-pulse"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
          {user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Welcome back, {user.firstName}!</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Your trading dashboard is ready. Continue managing your bots, analyzing performance, and maximizing your
                profits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/bots">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-3 bg-transparent"
                  >
                    Manage Bots
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Trading Journey?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful traders who trust CoinWayFinder to automate their cryptocurrency trading
                and maximize their profits.
              </p>

              {loading ? (
                <div className="flex justify-center space-x-4">
                  <div className="h-12 w-40 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-12 w-32 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                    >
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 px-8 py-3 bg-transparent"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span>$2.5M+ Volume Traded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>10,000+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span>Bank-Grade Security</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
