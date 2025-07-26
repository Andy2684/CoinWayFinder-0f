"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI-Powered Trading Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
            Master Crypto Trading
            <br />
            <span className="text-4xl md:text-6xl">with AI Precision</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Harness the power of artificial intelligence to make smarter trading decisions. Our advanced algorithms
            analyze market trends, execute trades, and maximize your profits 24/7.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Start Trading Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <Link href="/features">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 bg-transparent"
            >
              Explore Features
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <TrendingUp className="w-8 h-8 text-green-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-gray-400">Advanced market analysis with real-time insights and predictive modeling</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <Shield className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure Trading</h3>
            <p className="text-gray-400">
              Bank-level security with encrypted transactions and secure wallet integration
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <Zap className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">Automated Bots</h3>
            <p className="text-gray-400">AI-powered trading bots that work around the clock to maximize profits</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">Trusted by over 50,000+ traders worldwide</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div className="text-2xl font-bold text-white">$2.5B+</div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div className="text-2xl font-bold text-white">99.9%</div>
          </div>
          <div className="flex justify-center items-center gap-8 text-sm text-gray-500 mt-2">
            <span>Active Users</span>
            <span>Trading Volume</span>
            <span>Uptime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
