"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-12 border border-white/10 backdrop-blur-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Trading Journey?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful traders who are already using AI to maximize their profits. Start your free
            account today and experience the future of trading.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">$2.4M+</div>
              <div className="text-sm text-gray-400">Total Profits Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">10K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Link href="/auth/signup">
                Start Trading Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-400" />
              Bank-Grade Security
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              No Setup Fees
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              Cancel Anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
