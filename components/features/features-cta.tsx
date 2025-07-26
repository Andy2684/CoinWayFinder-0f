"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, TrendingUp, Shield, Star } from "lucide-react"
import Link from "next/link"

export function FeaturesCTA() {
  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Advanced Trading?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of traders who are already using our advanced features to maximize their crypto profits.
              Start your free trial today and discover the difference professional tools can make.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="text-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 mx-auto w-fit">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">AI Trading Bots</div>
                <div className="text-sm text-gray-300">Automated 24/7</div>
              </div>
              <div className="text-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 mb-3 mx-auto w-fit">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Bank-Grade Security</div>
                <div className="text-sm text-gray-300">Your funds protected</div>
              </div>
              <div className="text-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-3 mx-auto w-fit">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Advanced Analytics</div>
                <div className="text-sm text-gray-300">Professional insights</div>
              </div>
              <div className="text-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 mb-3 mx-auto w-fit">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Multi-Exchange</div>
                <div className="text-sm text-gray-300">15+ exchanges</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <span>Setup in 2 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
