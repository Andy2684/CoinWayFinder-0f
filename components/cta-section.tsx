"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, UserPlus, LogIn, Rocket, TrendingUp, Shield, Clock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function CTASection() {
  const { user } = useAuth()

  const benefits = [
    {
      icon: Rocket,
      title: "Quick Setup",
      description: "Get started in under 5 minutes",
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "94% average success rate",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Bank-grade security protection",
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      description: "Never miss market opportunities",
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-gray-900/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Main CTA */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            🎯 Limited Time Offer
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Game?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful traders who are already using AI to maximize their cryptocurrency profits.
            Start your journey today with our risk-free trial.
          </p>

          {/* Primary CTA Buttons */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Link href="/dashboard">
                  <Rocket className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm mb-16">
            <span className="flex items-center gap-1">✓ No Credit Card Required</span>
            <span className="flex items-center gap-1">✓ 7-Day Free Trial</span>
            <span className="flex items-center gap-1">✓ Cancel Anytime</span>
            <span className="flex items-center gap-1">✓ 24/7 Support</span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-colors text-center"
            >
              <CardContent className="p-6">
                <benefit.icon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary CTA */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 md:p-12 backdrop-blur-lg border border-white/10 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Still Have Questions?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our team of experts is here to help you get started. Schedule a free consultation or explore our
            comprehensive documentation and tutorials.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Link href="#contact">Schedule Consultation</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-gray-300 hover:text-white hover:bg-white/5">
              <Link href="#features">View Documentation</Link>
            </Button>
          </div>
        </div>

        {/* Final CTA */}
        {!user && (
          <div className="text-center mt-16 bg-gradient-to-r from-gray-900/50 to-blue-900/50 rounded-2xl p-8 backdrop-blur-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Don't Wait - The Market Never Sleeps</h3>
            <p className="text-gray-300 mb-6">
              Every moment you wait is a potential profit opportunity missed. Start your AI-powered trading journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent"
              >
                <Link href="/dashboard">View Live Demo</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
