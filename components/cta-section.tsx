"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRight,
  Mail,
  Shield,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Zap,
  Globe,
  Award,
  Play,
  Download,
  Calendar,
  Phone,
  MessageCircle,
} from "lucide-react"

export function CTASection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const trustIndicators = [
    { icon: Shield, label: "Bank-Grade Security", value: "256-bit SSL" },
    { icon: Users, label: "Active Traders", value: "50,000+" },
    { icon: TrendingUp, label: "Success Rate", value: "94.2%" },
    { icon: Star, label: "User Rating", value: "4.9/5" },
  ]

  const benefits = [
    "Start trading in under 5 minutes",
    "No setup fees or hidden costs",
    "24/7 customer support",
    "30-day money-back guarantee",
    "Access to all premium features",
    "Real-time market data",
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
          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-white/20 mb-6 px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Join 50,000+ Successful Traders
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Start
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Your Trading Journey?
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Join thousands of traders who are already using our AI-powered platform to maximize their profits and
            minimize risks.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-12 py-4 text-lg backdrop-blur-sm bg-transparent"
            >
              <Play className="mr-2 h-6 w-6" />
              Watch Demo
            </Button>

            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 px-12 py-4 text-lg">
              <Calendar className="mr-2 h-6 w-6" />
              Schedule Call
            </Button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Download App
            </Button>
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Phone className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Globe className="w-4 h-4 mr-2" />
              View Pricing
            </Button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-300">
                  Get the latest trading insights and market updates delivered to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                No spam, unsubscribe at any time. By subscribing, you agree to our Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{indicator.value}</div>
                <div className="text-gray-400 text-sm">{indicator.label}</div>
              </div>
            )
          })}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-4 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-white">{benefit}</span>
            </div>
          ))}
        </div>

        <Separator className="my-16 bg-white/10" />

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12 border border-blue-500/30 backdrop-blur-sm">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Don't Miss Out on the Crypto Revolution</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The crypto market never sleeps, and neither do our AI trading bots. Start your journey today and join the
            future of trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-12 py-4 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">No credit card required</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                  14-day free trial
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                  Cancel anytime
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                  Money-back guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
