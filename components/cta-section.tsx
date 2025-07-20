"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
            Ready to Start?
          </Badge>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Start Trading Smarter
              <br />
              <span className="text-emerald-200">Today</span>
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Join thousands of successful traders who are already using our platform to maximize their crypto profits
              with AI-powered automation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                Try Demo Account
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/20">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 text-emerald-200" />
              <div className="text-left">
                <div className="text-white font-semibold">Bank-Grade Security</div>
                <div className="text-emerald-200 text-sm">Your funds are protected</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Users className="w-8 h-8 text-emerald-200" />
              <div className="text-left">
                <div className="text-white font-semibold">10,000+ Users</div>
                <div className="text-emerald-200 text-sm">Trusted by traders worldwide</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <TrendingUp className="w-8 h-8 text-emerald-200" />
              <div className="text-left">
                <div className="text-white font-semibold">94% Success Rate</div>
                <div className="text-emerald-200 text-sm">Proven track record</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
