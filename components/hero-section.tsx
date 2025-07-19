"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Overlay with Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 animate-pulse" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-green-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl animate-float-fast" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <Badge variant="outline" className="glass border-emerald-200/20 text-emerald-100 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Trading Platform
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Trade Smarter with
              <span className="block bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                AI-Powered Signals
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Discover profitable trading opportunities with our advanced AI algorithms. Get real-time signals,
              automated bots, and comprehensive market analysis.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg" asChild>
              <Link href="/auth/signup">
                Start Trading Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass border-emerald-200/20 text-emerald-100 hover:bg-emerald-500/10 px-8 py-4 text-lg bg-transparent"
              asChild
            >
              <Link href="/signals">View Live Signals</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-xl border-emerald-200/20 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">94%</div>
              <div className="text-emerald-100">Success Rate</div>
            </div>
            <div className="glass p-6 rounded-xl border-emerald-200/20 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$50M+</div>
              <div className="text-emerald-100">Volume Traded</div>
            </div>
            <div className="glass p-6 rounded-xl border-emerald-200/20 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
              <div className="text-emerald-100">Automated</div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
            <Card className="glass border-emerald-200/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Smart Signals</h3>
                <p className="text-emerald-100">AI-powered trading signals with 94% accuracy rate</p>
              </CardContent>
            </Card>

            <Card className="glass border-emerald-200/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Risk Management</h3>
                <p className="text-emerald-100">Advanced risk controls to protect your investments</p>
              </CardContent>
            </Card>

            <Card className="glass border-emerald-200/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Automated Bots</h3>
                <p className="text-emerald-100">Set and forget trading bots that work 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
