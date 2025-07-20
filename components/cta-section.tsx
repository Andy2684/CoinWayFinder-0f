"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, UserPlus, LogIn, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function CTASection() {
  const [email, setEmail] = useState("")
  const { user } = useAuth()

  const benefits = [
    "Start trading in under 5 minutes",
    "No credit card required for free plan",
    "24/7 automated trading",
    "Bank-level security",
    "Cancel anytime",
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Join 50,000+ Successful Traders
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Start
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Earning?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of traders who are already using AI to maximize their crypto profits. Start your free trial
            today and see the difference intelligent trading makes.
          </p>

          {/* Benefits list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-transparent"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mb-12">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Email signup */}
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Input
                type="email"
                placeholder="Enter your email for updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">Get trading tips and market insights delivered to your inbox</p>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Questions? We're Here to Help</h3>
          <p className="text-gray-300 mb-6">
            Our team of trading experts is available 24/7 to help you get started and maximize your trading success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-6 py-3 font-semibold bg-transparent"
            >
              Contact Support
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 px-6 py-3 font-semibold">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16 pt-16 border-t border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">Don't Wait. Start Trading Today.</h3>
          <p className="text-gray-300 mb-8">
            Every day you wait is potential profit lost. Join the AI trading revolution now.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 font-semibold rounded-xl shadow-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 font-semibold rounded-xl bg-transparent"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 font-semibold rounded-xl shadow-lg"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
