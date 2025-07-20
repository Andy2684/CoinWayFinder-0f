"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, UserPlus, LogIn, Rocket, TrendingUp, Shield, Zap, Star, Users, Award } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function CTASection() {
  const { user } = useAuth()

  const benefits = [
    { icon: TrendingUp, text: "94.2% Success Rate" },
    { icon: Shield, text: "Bank-Grade Security" },
    { icon: Zap, text: "Lightning Fast Execution" },
    { icon: Users, text: "50K+ Active Traders" },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Professional Trader",
      text: "CoinWayFinder's AI bots have transformed my trading strategy. I've seen consistent profits since day one.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Crypto Investor",
      text: "The platform is incredibly user-friendly and the automated trading features are game-changing.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Day Trader",
      text: "Best trading platform I've used. The AI algorithms are incredibly sophisticated and profitable.",
      rating: 5,
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-6 py-3 mb-8 border border-white/20">
            <Rocket className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-white font-medium">Ready to Transform Your Trading?</span>
            <Award className="w-5 h-5 text-purple-400 ml-2" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Start Trading Like a
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Professional Today
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Join thousands of successful traders who trust CoinWayFinder's AI-powered platform to maximize their profits
            and minimize their risks in the volatile crypto market.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                  <p className="text-white font-medium">{benefit.text}</p>
                </div>
              )
            })}
          </div>

          {/* Primary CTA Buttons */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-10 py-5 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-3 h-6 w-6" />
                  Create Free Account
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-5 text-lg backdrop-blur-sm bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-3 h-6 w-6" />
                  Sign In to Account
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-10 py-5 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
              >
                <Link href="/dashboard">
                  <TrendingUp className="mr-3 h-6 w-6" />
                  Go to Dashboard
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-5 text-lg backdrop-blur-sm bg-transparent"
              >
                <Link href="/bots">
                  <Rocket className="mr-3 h-6 w-6" />
                  Create Your First Bot
                </Link>
              </Button>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400 mb-16">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-400" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              <span>50K+ Users</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-purple-400" />
              <span>Award Winning</span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">What Our Traders Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        {!user && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Don't Miss Out on the Crypto Revolution
              </h3>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                Every day you wait is potential profit lost. Join the thousands of traders already using our platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Member Login
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-gray-400">
                No credit card required • Free forever plan • Start trading in minutes
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
