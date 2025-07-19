"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-500/5 to-teal-600/10 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />

      {/* Dynamic Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/20 rounded-full blur-3xl animate-floating" />
      <div
        className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-emerald-300/15 rounded-full blur-2xl animate-floating"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/6 w-24 h-24 bg-teal-400/25 rounded-full blur-xl animate-floating"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-green-500/10 rounded-full blur-3xl animate-floating"
        style={{ animationDelay: "6s" }}
      />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 card-hover">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">AI-Powered Trading Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Trade Crypto with
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent block">
              AI Precision
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Maximize your crypto profits with advanced AI signals, automated trading bots, and real-time market
            analysis. Join thousands of successful traders.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">94%</div>
              <div className="text-green-200 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$50M+</div>
              <div className="text-green-200 text-sm">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-green-200 text-sm">Automated</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-white text-green-900 hover:bg-green-50 px-8 py-4 text-lg font-semibold group btn-transition"
              >
                Start Trading Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent btn-transition"
              >
                View Live Demo
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 card-hover">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Signals</h3>
              <p className="text-green-100 text-sm">AI-powered trading signals with 94% accuracy rate</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 card-hover">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Auto Trading</h3>
              <p className="text-green-100 text-sm">Automated bots execute trades 24/7 while you sleep</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 card-hover">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Risk Management</h3>
              <p className="text-green-100 text-sm">Advanced risk controls protect your investments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
